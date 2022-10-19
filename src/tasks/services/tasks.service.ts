import { Inject, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectBot() private readonly bot,
    private readonly schedulerRegistry: SchedulerRegistry,
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    private readonly usersCenterService: UsersCenterService,
  ) {}

  @Cron('* * 7 * * *', { name: 'notification_1', timeZone: 'Europe/Moscow' })
  handleCron() {
    console.log('Called when the current second is 45');
  }
}
