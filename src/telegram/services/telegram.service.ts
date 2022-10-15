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
import { consDiagnostic } from '../conversations/cons-diagnostic.conversation';

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

@Injectable()
export class TelegramService {
  constructor(
    @InjectBot() private readonly bot,
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    private readonly usersCenterService: UsersCenterService,
    @Inject(SignupsTokenEnum.SIGNUPS_SERVICES_TOKEN)
    private readonly signupsService: SignupsService,
  ) {}

  async sendRequest(obj: {
    telegramId: string;
    phoneNumber: string;
    comment: string;
    date: Date;
    duration: number;
    type: SignupsEnum;
  }) {
    const { telegramId, ...restObj } = obj;
    const user = await this.usersCenterService.repo
      .createQueryBuilder('U')
      .where('U.telegramId=:id', { id: telegramId })
      .select('U.id')
      .getOne();
    const signup = this.signupsService.createSign(restObj, user);
    await this.signupsService.repo.save(signup);
  }

  async consDiagnostic(
    type: SignupsEnum,
    conversation: MyConversation,
    ctx: MyContext,
  ) {
    //return diagnosticTest(conversation, ctx, this as unknown as TelegramUpdate);
    return consDiagnostic(
      conversation,
      ctx,
      this as unknown as TelegramUpdate,
      type,
    );
  }
}
