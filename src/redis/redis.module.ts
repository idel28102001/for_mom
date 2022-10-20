import { RedisTokenEnum } from './enums/tokens/redis.token.enum';
import { DatabaseModule } from '../database/database.module';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { RedisService } from './services/redis.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    DatabaseModule,
    // CacheModule.register(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 0,
      }),
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
