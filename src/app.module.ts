import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './users/users.module';
import { UsersCenterModule } from './users-center/users-center.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { SignupsModule } from './signups/signups.module';
import { GoogleModule } from './google/google.module';
import { TasksModule } from './tasks/tasks.module';
import { MeetingsModule } from './meetings/meetings.module';
import { TextsModule } from './texts/texts.module';

@Module({
  imports: [
    SignupsModule,
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TelegramModule,
    UsersModule,
    UsersCenterModule,
    GoogleModule,
    TasksModule,
    MeetingsModule,
    TextsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
