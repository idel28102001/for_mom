import { Context, session } from 'grammy';
import { Admin, Ctx, Hears, Help, Start, Update } from '@grammyjs/nestjs';
import { CONSTANTS } from '../../common/constants';
import {
  ConversationFlavor,
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { InjectBot } from 'nestjs-telegraf';
import { telegramMenuUtility } from '../utility/telegramMenuUtility';
import { Inject } from '@nestjs/common';
import { TelegramTokenEnum } from '../enums/tokens/telegram.token.enum';
import { TelegramService } from '../services/telegram.service';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { SignupsTokenEnum } from '../../signups/enums/signups.token.enum';
import { SignupsService } from '../../signups/services/signups.service';
import { SignupsEnum } from '../../signups/enums/signups.enum';

type MyContext = Context & ConversationFlavor;

@Update()
export class TelegramUpdate {
  constructor(
    @InjectBot() private readonly bot,
    @Inject(TelegramTokenEnum.TELEGRAM_SERVICES_TOKEN)
    readonly telegramService: TelegramService,

    @Inject(SignupsTokenEnum.SIGNUPS_SERVICES_TOKEN)
    readonly signupsService: SignupsService,

    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    private readonly usersCenterService: UsersCenterService,
  ) {
    bot.use(session({ initial: () => ({}) }));
    bot.use(conversations());
    bot.hears('Отмена', async (ctx) => {
      await ctx.conversation.exit();
      await telegramMenuUtility(ctx);
    });
    bot.use(
      createConversation(
        this.telegramService.consDiagnostic.bind(this, SignupsEnum.DIAGNOSTIC),
        'diagnostic',
      ),
    );
    bot.use(
      createConversation(
        this.telegramService.consDiagnostic.bind(
          this,
          SignupsEnum.CONSULTATION,
        ),
        'consultation',
      ),
    );
  }

  @Start()
  async onStart(@Ctx() ctx: Context): Promise<void> {
    await this.usersCenterService.saveToDBUser(ctx.from);
    await telegramMenuUtility(ctx);
  }
  @Hears(CONSTANTS.DIAGNOSTIC)
  async diag(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.conversation.enter('diagnostic');
  }

  @Hears(CONSTANTS.CONSULTATION)
  async cons(@Ctx() ctx: MyContext): Promise<void> {
    await ctx.conversation.enter('consultation');
  }

  @Help()
  async onHelp(@Ctx() ctx: Context): Promise<void> {
    await ctx.reply('Это бот записей на онлайн приём к Эльмире Гатауллиной');
  }

  @Admin()
  async onAdminCommand(@Ctx() ctx: Context): Promise<void> {
    await ctx.reply('Welcome, Judge');
  }
}
