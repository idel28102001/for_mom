import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SignupsEnum } from '../../signups/enums/signups.enum';
import { addMinutes, compareAsc, differenceInSeconds } from 'date-fns';
import { DIALOGS } from '../../common/texts';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getCounts() {
    const all = await this.getAllByKeys();
    return all.length;
  }

  async getAllByKeys() {
    const all = await this.getAll();
    return all.filter(
      (e) => compareAsc(new Date(e), addMinutes(new Date(), 15)) === 1,
    );
  }

  async getFromArrayWithoutExisting(array: Array<string>) {
    const allRedis = await this.getAllByKeys();
    return array.filter((e) => !allRedis.includes(e));
  }

  async createEvent(
    name: string,
    obj: {
      telegramId: string;
      date: Date;
      type: SignupsEnum;
      stage: number;
    },
    ttl: number,
  ) {
    return await this.set(name, JSON.stringify(obj), ttl);
  }

  async editEvent(
    name: string,
    newName: string,
    obj: {
      telegramId: string;
      date: Date;
      type: SignupsEnum;
      stage: number;
    },
  ) {
    const curr = DIALOGS.MEETINGS.FUTURE;
    const date =
      obj.stage === 1 ? curr.A5.date(obj.date) : curr.A6.date(obj.date);
    const ttl =
      differenceInSeconds(obj.date, date, { roundingMethod: 'ceil' }) + 60;

    await this.del(name);
    await this.createEvent(name, obj, ttl);
  }

  async getAll(): Promise<Array<string>> {
    return await this.cacheManager.store.keys();
  }

  async get<T>(key: string): Promise<T> {
    return await this.cacheManager.get<T>(key);
  }

  async getByPattern<T>(pattern: string) {
    return await this.cacheManager.store.keys(pattern);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<T | void> {
    await this.cacheManager.set(key, value, { ttl });
  }

  async del(key: string): Promise<void> {
    return this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    return this.cacheManager.reset();
  }

  async removeByPattern(pattern: string): Promise<void> {
    const keys = await this.getByPattern<string[]>(pattern);

    await Promise.all(
      keys.map(async (key) => {
        await this.del(key);
      }),
    );
  }
}
