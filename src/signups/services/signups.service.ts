import { Inject, Injectable } from '@nestjs/common';
import { SignupsEntity } from '../entities/signups.entity';
import { Between, FindManyOptions, MoreThan, Repository } from 'typeorm';
import { SignupsEnum } from '../enums/signups.enum';
import { addDays, format } from 'date-fns';
import { orderEntTimes } from '../../common/utils';
import { SignupsTokenEnum } from '../enums/signups.token.enum';

@Injectable()
export class SignupsService {
  constructor(
    @Inject(SignupsTokenEnum.SIGNUPS_REPOSITORY_TOKEN)
    private readonly signupsRepo: Repository<SignupsEntity>,
  ) {}

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

  async uploadTimes(
    array: Array<string>,
    dateWhole: string,
    type: SignupsEnum,
  ) {
    const oldOnes = await this.signupsRepo.find({
      where: { date: MoreThan(dateWhole) as any },
      relations: ['user'],
    });
    const messageId = oldOnes.length ? oldOnes[0].messageId : null;
    const result = array.map((e) => {
      const date = new Date(`${dateWhole} ${e}`);
      return this.create({ date, type, messageId }) as any as SignupsEntity;
    });
    const dates = orderEntTimes([...result, ...oldOnes]);
    return { dates, messageId };
    // return await this.save(result);
  }

  async save(elems) {
    return await this.signupsRepo.save(elems);
  }

  create(elem) {
    return this.signupsRepo.create(elem);
  }
}
