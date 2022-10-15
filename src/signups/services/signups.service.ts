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
  subMinutes,
} from 'date-fns';
import { SignupsTokenEnum } from '../enums/signups.token.enum';
import { UsersCenterEntity } from '../../users-center/entities/users.entity';

const funt = (day: Date, endTime = 1170) => {
  const start = format(day, 'yyyy-MM-dd');
  const endDate = format(addDays(day, 7), 'yyyy-MM-dd');

  return `select gs2 as date,duration from (public.signups s FULL JOIN
    (select gs2::timestamp
    from generate_series('${start}', '${endDate}', interval '1 day') gs
    left join lateral
    (select gs2::timestamp
    from generate_series(gs::timestamp + interval '8 hours',
    gs::timestamp + interval '${endTime} minutes',
    interval '30 minutes') gs2) lj on true) d on d.gs2=s.date)
          where gs2>'${start}' and gs2<'${endDate}' 
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

  async checkIfOK(obj: {
    telegramId: string;
    date: Date;
    type: SignupsEnum;
    comment: string;
    phoneNumber: string;
    duration: number;
  }) {
    const result = await this.signupsRepo
      .createQueryBuilder('S')
      .where('"S".date>:startDate AND "S".date<:endDate', {
        startDate: subMinutes(obj.date, 1),
        endDate: addMinutes(obj.date, obj.duration - 1),
      })
      .getCount();
    return !!result;
  }

  async getDays(times: number, startDate: Date) {
    const dates = await this.getAllDaysWithTimes(startDate);
    const all: Array<{ day: string; times: Array<{ date: Date }> }> = [];
    Array.from(dates.keys()).forEach((e) => {
      const current = dates.get(e).sort((a, b) => compareDesc(a.date, b.date));
      let curr: Array<{ date: Date; test: string; access: number }> = [
        { date: current[0].date, test: current[0].test, access: 30 },
      ];
      let i = 1;
      let prevTime = curr[0].date;
      while (i < current.length) {
        const { date, test } = current[i];
        if (compareAsc(subMinutes(prevTime, 30), date) === 0) {
          curr.push({ date, test, access: curr[i - 1].access + 30 });
        } else {
          curr.push({ date, test, access: 30 });
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

  async getAllDaysWithTimes(startDate: Date) {
    const all = (await this.signupsRepo.query(funt(startDate))) as Array<{
      date: Date;
      duration: null | string;
    }>;
    const dates: Map<
      string,
      Array<{
        date: Date;
        duration: null | string;
        test: string;
        access: number;
      }>
    > = new Map();
    const first = all[0];
    let firstDate = format(first.date, 'yyyy-MM-dd');
    dates.set(firstDate, []);
    let someToPass = first.duration ? Number(first.duration) / 30 : 0;
    let i = 0;
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
          dates
            .get(firstDate)
            .push({ date, duration, test: format(date, 'kk:mm'), access: 0 });
        } else {
          someToPass = duration ? Number(duration) / 30 - 1 : 0;
        }
        i++;
      } else {
        someToPass = duration ? Number(duration) / 30 - 1 : 0;
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

  // async uploadTimes(
  //   array: Array<string>,
  //   dateWhole: string,
  //   type: SignupsEnum,
  // ) {
  //   const oldOnes = await this.signupsRepo.find({
  //     where: { date: MoreThan(dateWhole) as any },
  //     relations: ['user'],
  //   });
  //   const messageId = oldOnes.length ? oldOnes[0].messageId : null;
  //   const result = array.map((e) => {
  //     const date = new Date(`${dateWhole} ${e}`);
  //     return this.create({ date, type, messageId }) as any as SignupsEntity;
  //   });
  //   const dates = orderEntTimes([...result, ...oldOnes]);
  //   return { dates, messageId };
  //   // return await this.save(result);
  // }

  async save(elems) {
    return await this.signupsRepo.save(elems);
  }

  create(elem) {
    return this.signupsRepo.create(elem);
  }
}
