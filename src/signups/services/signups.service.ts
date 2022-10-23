import { Inject, Injectable } from '@nestjs/common';
import { SignupsEntity } from '../entities/signups.entity';
import { Between, FindManyOptions, Repository } from 'typeorm';
import { SignupsEnum } from '../enums/signups.enum';
import {
  addDays,
  addMinutes,
  compareAsc,
  compareDesc,
  format,
  getHours,
  subDays,
  subMinutes,
} from 'date-fns';
import { SignupsTokenEnum } from '../enums/signups.token.enum';
import { UsersCenterEntity } from '../../users-center/entities/users.entity';

const funt = (day: Date, endTime = 1170) => {
  let start: string;
  let startCondition: string;
  if (getHours(day) < 9) {
    start = format(subDays(day, 1), 'yyyy-MM-dd kk:mm');
    startCondition = format(subDays(day, 1), 'yyyy-MM-dd');
  } else {
    start = format(day, 'yyyy-MM-dd');
    startCondition = start.toString();
  }
  const endDate = format(addDays(day, 7), 'yyyy-MM-dd');

  return `select gs2 as date,duration from (public.signups s FULL JOIN
    (select gs2::timestamp
    from generate_series('${startCondition}', '${endDate}', interval '1 day') gs
    left join lateral
    (select gs2::timestamp
    from generate_series(gs::timestamp + interval '8 hours',
    gs::timestamp + interval '${endTime} minutes',
    interval '30 minutes') gs2) lj on true) d on d.gs2=s.date)
          where gs2>='${start}' and gs2<'${endDate}' 
          order by gs2 asc;
 `;
};

@Injectable()
export class SignupsService {
  constructor(
    @Inject(SignupsTokenEnum.SIGNUPS_REPOSITORY_TOKEN)
    private readonly signupsRepo: Repository<SignupsEntity>,
  ) {}

  get repo() {
    return this.signupsRepo;
  }

  async editComment({
    meetingId,
    comment,
  }: {
    meetingId: number;
    comment: string;
  }) {
    await this.signupsRepo.update({ id: meetingId }, { comment });
  }

  async getAll(isAdmin: boolean, telegramId: string) {
    const fromRepo = this.signupsRepo
      .createQueryBuilder('S')
      .innerJoin('S.user', 'U')
      .where('"S".date>now()')
      .orderBy('S.date', 'ASC')
      .addSelect([
        'U.id',
        'U.phoneNumber',
        'U.username',
        'U.firstname',
        'U.lastname',
      ]);
    if (!isAdmin) {
      fromRepo.andWhere('U.telegramId=:telegramId', { telegramId });
    }
    const daysRepo: Array<{ date: string; meetings: Array<SignupsEntity> }> =
      [];
    (await fromRepo.getMany()).forEach((e) => {
      const currentDay = format(e.date, 'yyyy-MM-dd');
      const day = daysRepo.find((elem) => elem.date === currentDay);
      if (!day) {
        daysRepo.push({ date: currentDay, meetings: [e] });
      } else {
        day.meetings.push(e);
      }
    });
    return { daysForKeyboard: daysRepo.map((e) => e.date), all: daysRepo };
  }

  async checkIfOK(obj: { date: Date; duration: number }, meetId = 0) {
    const result = await this.signupsRepo
      .createQueryBuilder('S')
      .where('"S".date>:startDate AND "S".date<:endDate', {
        startDate: subMinutes(obj.date, 1),
        endDate: addMinutes(obj.date, obj.duration - 1),
      })
      .andWhere('"S".id!=:meetId', { meetId })
      .getCount();
    return !!result;
  }

  async getDays(
    times: number,
    startDate: Date,
    dateToFilter = subMinutes(new Date(), 30),
  ) {
    const dates = await this.getAllDaysWithTimes(
      startDate,
      times,
      dateToFilter,
    );
    const all: Array<{ day: string; times: Array<{ date: Date }> }> = [];
    Array.from(dates.keys()).forEach((e) => {
      const current = dates.get(e).sort((a, b) => compareDesc(a.date, b.date));
      if (!current.length) {
        return;
      }
      let curr: Array<{ date: Date; access: number }> = [
        { date: current[0].date, access: 30 },
      ];
      let i = 1;
      let prevTime = curr[0].date;
      while (i < current.length) {
        const { date } = current[i];
        if (compareAsc(subMinutes(prevTime, 30), date) === 0) {
          curr.push({ date, access: curr[i - 1].access + 30 });
        } else {
          curr.push({ date, access: 30 });
        }
        prevTime = curr[i].date;
        i++;
      }
      curr = curr.filter((e) => e.access >= times);
      if (curr.length) {
        all.push({
          day: e,
          times: curr
            .sort((a, b) => compareAsc(a.date, b.date))
            .map((e) => ({ date: e.date })),
        });
      }
    });
    return all;
  }

  async getAllDaysWithTimes(
    startDate: Date,
    times: number,
    dateToFilter: Date,
  ) {
    const all = (await this.signupsRepo.query(funt(startDate))) as Array<{
      date: Date;
      duration: null | string;
    }>;
    const day = all.find(
      (e) =>
        format(e.date, 'yyyy-MM-dd kk:mm') ===
        format(dateToFilter, 'yyyy-MM-dd kk:mm'),
    );
    if (day) {
      day.duration = null;
    }
    const dates: Map<
      string,
      Array<{
        date: Date;
        duration: null | string;
        access: number;
      }>
    > = new Map();
    const first = all[0];
    let firstDate = format(first.date, 'yyyy-MM-dd');
    dates.set(firstDate, []);
    let someToPass = first.duration ? Number(first.duration) / 30 : 0;
    let i = 0;
    let sum = 0;
    while (i < all.length) {
      const { date, duration } = all[i];
      if (someToPass) {
        someToPass--;
        i++;
        continue;
      }
      const currentDate = format(date, 'yyyy-MM-dd');
      if (currentDate === firstDate) {
        if (!duration) {
          dates.get(firstDate).push({ date, duration, access: 0 });
        } else {
          sum += Number(duration);
          someToPass = duration ? Number(duration) / 30 - 1 : 0;
        }
        i++;
      } else {
        if (sum >= 60 * 8 - times) {
          dates.delete(firstDate);
        }
        sum = 0;
        someToPass = duration ? Number(duration) / 30 : 0;
        firstDate = currentDate;
        dates.set(firstDate, []);
      }
    }
    return dates;
  }

  createSign(
    obj: {
      date: Date;
      type: SignupsEnum;
      comment: string;
      duration: number;
      calendarEventId: string;
    },
    user: UsersCenterEntity,
  ) {
    return this.signupsRepo.create({
      ...obj,
      user,
    });
  }

  async findByDate(date: Date) {
    const firstDate = new Date(format(date, 'yyyy-MM-dd'));
    const secondDate = addDays(new Date(format(date, 'yyyy-MM-dd')), 1);
    return await this.signupsRepo.find({
      where: { date: Between(firstDate, secondDate) as any },
    });
  }

  async find(options?: FindManyOptions<SignupsEntity>) {
    return await this.signupsRepo.find(options);
  }

  async save(elems) {
    return await this.signupsRepo.save(elems);
  }

  create(elem) {
    return this.signupsRepo.create(elem);
  }
}
