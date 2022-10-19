import { Context } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { config } from '../../common/config';
import { TelegramUpdate } from '../updates/telegram.update';
import { RolesEnum } from '../../users-center/enums/roles.enum';
import { DIALOGS } from '../../common/constants';

type MyConversation = Conversation<MyContext>;
type MyContext = Context & ConversationFlavor;

export const makeMeAdmin = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
) => {
  const password = await conversation.form.text();
  if (password === config.getSecret) {
    await conversation.external(async () => {
      await thisv2.usersCenterService.makeAdmin(ctx.from.id.toString());
    });
    (ctx.session as any).role = RolesEnum.ADMIN;
    await ctx.reply(DIALOGS.OTHER.ADMIN);
  }
};
