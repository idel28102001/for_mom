import { Inject, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';
import { SignupsTokenEnum } from '../../signups/enums/signups.token.enum';
import { SignupsService } from '../../signups/services/signups.service';
import { TextsTokenEnum } from '../../texts/enums/texts.token.enum';
import { TextsService } from '../../texts/services/texts.service';
import { RolesEnum } from '../../users-center/enums/roles.enum';
import { addDays, compareAsc, format, formatRelative } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DIALOGS } from '../../common/texts';
import { SignupsNamesEnum } from '../../signups/enums/signups-names.enum';
import { SignupsEnum } from '../../signups/enums/signups.enum';
import { CronJob } from 'cron';
import { RedisTokenEnum } from '../../redis/enums/tokens/redis.token.enum';
import { RedisService } from '../../redis/services/redis.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectBot() private readonly bot,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    private readonly usersCenterService: UsersCenterService,

    @Inject(TextsTokenEnum.TEXTS_SERVICES_TOKEN)
    private readonly textsService: TextsService,

    @Inject(SignupsTokenEnum.SIGNUPS_SERVICES_TOKEN)
    private readonly signupsService: SignupsService,

    @Inject(RedisTokenEnum.REDIS_SERVICES_TOKEN)
    private readonly redisService: RedisService,
  ) {
    (async () => {
      const allKeys = await this.redisService.getAll();
      await Promise.all(
        allKeys.map(async (key) => {
          if (compareAsc(new Date(), new Date(key)) !== -1) {
            return;
          }
          const currObj = await this.redisService.get<string>(key);
          const obj = JSON.parse(currObj);
          await this.createEvent(obj, obj.stage);
        }),
      );
    })();
  }

  async editEvent(
    id: string,
    obj: {
      telegramId: string;
      date: Date;
      type: SignupsEnum;
    },
  ) {
    const stage = 1;
    await this.redisService.editEvent(
      id,
      format(obj.date, 'yyyy-MM-dd kk:mm'),
      { ...obj, stage },
    );
    await this.deleteEvent(id);
    await this.createEvent(obj, stage);
  }

  async deleteEvent(id: string) {
    await this.redisService.del(id);
    try {
      this.schedulerRegistry.deleteCronJob(id);
    } catch (e) {}
  }

  async createEvent(
    obj: {
      telegramId: string;
      date: Date;
      type: SignupsEnum;
    },
    stage = 1,
  ) {
    obj.date = new Date(obj.date);
    const currName = format(obj.date, 'yyyy-MM-dd kk:mm');
    const curr = DIALOGS.MEETINGS.FUTURE;
    let date: Date = undefined;
    let currText = '';
    if (stage === 1) {
      date = curr.A5.date(obj.date);
      currText = curr.A5.text;
    } else {
      date = curr.A6.date(obj.date);
      currText = curr.A6.text;
    }
    const job = new CronJob(date, async () => {
      await this.bot.api
        .sendMessage(
          obj.telegramId,
          `${currText} ${DIALOGS.MEETINGS.FUTURE.A1} ${
            SignupsNamesEnum[obj.type]
          }`,
        )
        .catch((e) => {});
      if (stage === 1) {
        await this.redisService.editEvent(currName, currName, {
          ...obj,
          stage: 2,
        });
        this.schedulerRegistry.deleteCronJob(currName);
        await this.createEvent(obj, 2);
      }
    });
    await this.redisService.editEvent(currName, currName, { ...obj, stage });
    await this.createIfCan(currName, job);
    return currName;
  }

  async createIfCan(name: string, job: CronJob) {
    try {
      this.schedulerRegistry.getCronJob(name);
    } catch (e) {
      this.schedulerRegistry.addCronJob(name, job);
    } finally {
      this.schedulerRegistry.deleteCronJob(name);
      this.schedulerRegistry.addCronJob(name, job);
    }
    job.start();
  }

  @Cron('0 0 23 * * *', { name: 'notification_1', timeZone: 'Europe/Moscow' })
  async notifyByNight() {
    await this.handleCron(1);
  }

  @Cron('0 0 7 * * *', { name: 'notification_2', timeZone: 'Europe/Moscow' })
  async notifyByMorning() {
    await this.handleCron(0);
  }

  @Cron('0 0 21 * * *', { name: 'notification_3', timeZone: 'Europe/Moscow' })
  async notifyMembersByNoon() {
    await this.notifyMembers(1);
  }

  @Cron('0 0 9 * * *', { name: 'notification_4', timeZone: 'Europe/Moscow' })
  async notifyMembersByMorning() {
    await this.notifyMembers(0);
  }

  async notifyMembers(plusDays = 0) {
    const signups = await this.signupsService.repo
      .createQueryBuilder('S')
      .where(
        `CAST("S".date AS DATE) = CAST(CURRENT_DATE + interval '${plusDays} day' AS DATE)`,
      )
      .andWhere(`CURRENT_DATE + interval '3 hours'<"S".date`)
      .innerJoin('S.user', 'U')
      .addSelect([
        'U.id',
        'U.phoneNumber',
        'U.username',
        'U.firstname',
        'U.lastname',
        'U.telegramId',
      ])
      .orderBy('S.date', 'ASC')
      .getMany();
    const users = Array.from(
      new Map(signups.map((e) => [e.user.id, e.user])).values(),
    );
    await Promise.all(
      users.map(async (e) => {
        const signUps = signups.filter((elem) => elem.user.id === e.id);
        let text = '';
        if (signUps.length === 1) {
          const sign = signUps[0];
          const thatDay = formatRelative(sign.date, new Date(), { locale: ru });
          text = `${thatDay} ${DIALOGS.MEETINGS.FUTURE.A1} ${
            SignupsNamesEnum[sign.type]
          }`;
        } else {
          const current = plusDays
            ? DIALOGS.MEETINGS.FUTURE.A2
            : DIALOGS.MEETINGS.FUTURE.A3;
          text =
            `${current} ${DIALOGS.MEETINGS.FUTURE.A1}\n` +
            signUps
              .map((e) => {
                return `${DIALOGS.MEETINGS.FUTURE.A4} ${format(
                  e.date,
                  'kk:mm',
                )} ${SignupsNamesEnum[e.type]}`;
              })
              .join('\n');
        }
        await this.bot.api
          .sendMessage(Number(e.telegramId), text, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          })
          .catch((e) => {});
      }),
    );
  }

  async handleCron(plusDays = 0) {
    const users = await this.usersCenterService.repo.find({
      where: { role: RolesEnum.ADMIN },
    });

    const signups = await this.signupsService.repo
      .createQueryBuilder('S')
      .where(
        `CAST("S".date AS DATE) = CAST(CURRENT_DATE + interval '${plusDays} day' AS DATE)`,
      )
      .innerJoin('S.user', 'U')
      .addSelect([
        'U.id',
        'U.phoneNumber',
        'U.username',
        'U.firstname',
        'U.lastname',
      ])
      .orderBy('S.date', 'ASC')
      .getMany();
    const thatDay = format(addDays(new Date(), plusDays), 'd MMMM (cccc)', {
      locale: ru,
    });
    let text = '';
    if (!signups.length) {
      text = `${thatDay}\n\n${DIALOGS.MEETINGS.DAYS.A1}`;
    } else {
      text = this.textsService.prepareText(thatDay, signups, true);
    }
    await Promise.all(
      users.map(async (user) => {
        await this.bot.api
          .sendMessage(Number(user.telegramId), text, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          })
          .catch((e) => {});
      }),
    );
  }
}
