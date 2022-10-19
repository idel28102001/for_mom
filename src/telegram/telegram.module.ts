import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from '../common/config';
import { NestjsGrammyModule } from '@grammyjs/nestjs';
import { TelegramProvider } from './telegram.provider';
import { SignupsModule } from '../signups/signups.module';
import { UsersCenterModule } from '../users-center/users-center.module';
import { TelegramTokenEnum } from './enums/tokens/telegram.token.enum';
import { GoogleModule } from '../google/google.module';
import { TasksModule } from '../tasks/tasks.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { TextsModule } from '../texts/texts.module';

@Module({
  imports: [
    MeetingsModule,
    TextsModule,
    TasksModule,
    GoogleModule,
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
  exports: [TelegramTokenEnum.TELEGRAM_SERVICES_TOKEN],
})
export class TelegramModule {}
