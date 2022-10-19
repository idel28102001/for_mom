import { RedisTokenEnum } from './enums/tokens/redis.token.enum';
import { DatabaseModule } from '../database/database.module';
import type { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';
import { config } from '../common/config';

@Module({
  imports: [
    DatabaseModule,
    // CacheModule.register(),
    CacheModule.register<ClientOpts>({
      isGlobal: true,
      store: redisStore,
      host: config.get('REDIS_HOST'),
      port: Number(config.get('REDIS_PORT')),
    }),
    // CacheModule.register<ClientOpts>({
    //   store: redisStore,
    // }),
  ],
  providers: [
    { useClass: RedisService, provide: RedisTokenEnum.REDIS_SERVICES_TOKEN },
  ],
  exports: [RedisTokenEnum.REDIS_SERVICES_TOKEN],
})
export class RedisModule {}
