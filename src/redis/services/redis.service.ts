import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SignupsEnum } from '../../signups/enums/signups.enum';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  redisManager;
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    this.redisManager = createClient({
      url: 'redis://default:redispw@localhost:49155',
    });
    (async () => {
      console.log(this.redisManager);
      await this.redisManager.connect();
    })();
  }

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
      await this.redisManager.set('123', '321');
      const aaa = await this.redisManager.get('');
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
