import { Context } from 'grammy';
import { Ctx, Help, Start, Update } from '@grammyjs/nestjs';
import { ConversationFlavor } from '@grammyjs/conversations';
import { InjectBot } from 'nestjs-telegraf';
import { telegramMenuUtility } from '../utility/telegramMenuUtility';
import { Inject } from '@nestjs/common';
import { TelegramTokenEnum } from '../enums/tokens/telegram.token.enum';
import { TelegramService } from '../services/telegram.service';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { SignupsTokenEnum } from '../../signups/enums/signups.token.enum';
import { SignupsService } from '../../signups/services/signups.service';
import { GoogleTokenEnum } from '../../google/enums/google.token.enum';
import { GoogleService } from '../../google/services/google.service';
import { TasksTokenEnum } from '../../tasks/enums/tokens/tasks.token.enum';
import { TasksService } from '../../tasks/services/tasks.service';
import { composer } from '../composers/telegram.composer';
import { MeetingsTokenEnum } from '../../meetings/enums/meetings.token.enum';
import { MeetingsService } from '../../meetings/services/meetings.service';
import { TextsTokenEnum } from '../../texts/enums/texts.token.enum';
import { TextsService } from '../../texts/services/texts.service';
import { RedisTokenEnum } from '../../redis/enums/tokens/redis.token.enum';
import { RedisService } from '../../redis/services/redis.service';

type MyContext = Context & ConversationFlavor;

@Update()
export class TelegramUpdate {
  constructor(
    @InjectBot() private readonly bot,
    @Inject(TelegramTokenEnum.TELEGRAM_SERVICES_TOKEN)
    readonly telegramService: TelegramService,
    @Inject(MeetingsTokenEnum.MEETINGS_SERVICES_TOKEN)
    readonly meetingsService: MeetingsService,
    @Inject(TasksTokenEnum.TASKS_SERVICES_TOKEN)
    readonly tasksService: TasksService,
    @Inject(GoogleTokenEnum.GOOGLE_SERVICES_TOKEN)
    readonly googleService: GoogleService,
    @Inject(RedisTokenEnum.REDIS_SERVICES_TOKEN)
    readonly redisService: RedisService,
    @Inject(SignupsTokenEnum.SIGNUPS_SERVICES_TOKEN)
    readonly signupsService: SignupsService,
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    readonly usersCenterService: UsersCenterService,
    @Inject(TextsTokenEnum.TEXTS_SERVICES_TOKEN)
    readonly textsService: TextsService,
  ) {
    bot.use(composer(this));
  }

  @Start()
  async onStart(@Ctx() ctx: MyContext): Promise<void> {
    await this.usersCenterService.saveToDBUser(ctx.from);
    await telegramMenuUtility(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context): Promise<void> {
    await ctx
      .reply('Это бот записей на онлайн приём к Эльмире Гатауллиной')
      .catch(() => undefined);
  }
}
