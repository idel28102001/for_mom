import { Inject, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';
import { SignupsTokenEnum } from '../../signups/enums/signups.token.enum';
import { SignupsService } from '../../signups/services/signups.service';
import { SignupsEnum } from '../../signups/enums/signups.enum';
import { TelegramUpdate } from '../updates/telegram.update';
import { makeMeAdmin } from '../conversations/make-me-admin.conversation';
import { allMeets } from '../conversations/all-meets.conversation';
import { RolesEnum } from '../../users-center/enums/roles.enum';
import { SignupsEntity } from '../../signups/entities/signups.entity';
import { menuKeyboard } from '../utility/telegramMenuUtility';
import { cancelMeet } from '../conversations/cancel-meet.conversation';
import { TextsTokenEnum } from '../../texts/enums/texts.token.enum';
import { TextsService } from '../../texts/services/texts.service';
import { editMeet } from '../conversations/edit-meet.conversation';
import { diagnosticTest } from '../conversations/diagnostic-test.conversation';

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

@Injectable()
export class TelegramService {
  calendar;
  constructor(
    @InjectBot() private readonly bot,
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    private readonly usersCenterService: UsersCenterService,
    @Inject(SignupsTokenEnum.SIGNUPS_SERVICES_TOKEN)
    private readonly signupsService: SignupsService,
    @Inject(TextsTokenEnum.TEXTS_SERVICES_TOKEN)
    private readonly textsService: TextsService,
  ) {}

  async sendMeetingsInfo(
    thatDay: string,
    meetings: SignupsEntity[],
    ctx: MyContext,
    isAdmin: boolean,
  ) {
    const text = this.textsService.prepareText(thatDay, meetings, isAdmin);
    await ctx.reply(text, {
      ...menuKeyboard,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  }

  async editMeet(conversation: MyConversation, ctx: MyContext) {
    return await editMeet(conversation, ctx, this as unknown as TelegramUpdate);
  }

  async ifAdmin(ctx: MyContext) {
    let role1 = (ctx.session as any).role;
    if (!role1) {
      const { role } = await this.usersCenterService.repo.findOne({
        where: { telegramId: ctx.from.id.toString() },
        select: ['id', 'role'],
      });
      (ctx.session as any).role = role;
      role1 = role;
    }
    return role1 === RolesEnum.ADMIN;
  }

  async allMeets(conversation: MyConversation, ctx: MyContext) {
    return await allMeets(conversation, ctx, this as unknown as TelegramUpdate);
  }
  async cancelMeet(conversation: MyConversation, ctx: MyContext) {
    return await cancelMeet(
      conversation,
      ctx,
      this as unknown as TelegramUpdate,
    );
  }

  async makeMeAdmin(conversation: MyConversation, ctx: MyContext) {
    return makeMeAdmin(conversation, ctx, this as unknown as TelegramUpdate);
  }

  async consDiagnostic(
    type: SignupsEnum,
    conversation: MyConversation,
    ctx: MyContext,
  ) {
    return diagnosticTest(
      conversation,
      ctx,
      this as unknown as TelegramUpdate,
      type,
    );
    // return consDiagnostic(
    //   conversation,
    //   ctx,
    //   this as unknown as TelegramUpdate,
    //   type,
    // );
  }
}
