import { Module } from '@nestjs/common';
import { MeetingsProvider } from './meetings.provider';
import { GoogleModule } from '../google/google.module';
import { UsersCenterModule } from '../users-center/users-center.module';
import { SignupsModule } from '../signups/signups.module';
import { MeetingsTokenEnum } from './enums/meetings.token.enum';
import { TasksModule } from '../tasks/tasks.module';
import { TextsModule } from '../texts/texts.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    GoogleModule,
    UsersCenterModule,
    SignupsModule,
    RedisModule,
    TasksModule,
    TextsModule,
  ],
  providers: MeetingsProvider,
  exports: [MeetingsTokenEnum.MEETINGS_SERVICES_TOKEN],
})
export class MeetingsModule {}
