import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SignupsEnum } from '../../signups/enums/signups.enum';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async createEvent(obj: {
    telegramId: string;
    date: Date;
    type: SignupsEnum;
    stage: number;
  }) {
    try {
      // console.log(123, format(obj.date, 'yyyy-MM-dd kk:mm'));
      // const rrr = await this.set('123312', JSON.stringify(obj), 0);
      // const aaa = await this.getByPattern('');
      // console.log(aaa);
      // await this.cacheManager.set('333', '333', 0);
      const aaa = await this.cacheManager.get('333');
      console.log(aaa, 123);
    } catch (e) {
      console.log(e);
    }
  }

  async get<T>(key: string): Promise<T | void> {
    return await this.cacheManager.get<T>(key);
  }

  async getByPattern<T>(pattern: string) {
    return await this.cacheManager.store.keys(pattern);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<T | void> {
    return await this.cacheManager.set(key, value, {
      ttl,
    } as unknown as number);
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
