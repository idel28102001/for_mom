import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from '../common/config';
import { NestjsGrammyModule } from '@grammyjs/nestjs';
import { TelegramProvider } from './telegram.provider';
import { SignupsModule } from '../signups/signups.module';
import { UsersCenterModule } from '../users-center/users-center.module';

@Module({
  imports: [
    UsersCenterModule,
    SignupsModule,
    ConfigModule.forRoot(),
    DatabaseModule,
    NestjsGrammyModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        token: config.get<string>('TOKEN'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: TelegramProvider,
})
export class TelegramModule {}
