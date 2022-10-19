import { Module } from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { DatabaseModule } from '../database/database.module';
import { UsersCenterModule } from '../users-center/users-center.module';
import { NestjsGrammyModule } from '@grammyjs/nestjs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from '../common/config';
import { TasksTokenEnum } from './enums/tokens/tasks.token.enum';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    UsersCenterModule,
    NestjsGrammyModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        token: config.get<string>('TOKEN'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    { useClass: TasksService, provide: TasksTokenEnum.TASKS_SERVICES_TOKEN },
  ],
  exports: [TasksTokenEnum.TASKS_SERVICES_TOKEN],
})
export class TasksModule {}
