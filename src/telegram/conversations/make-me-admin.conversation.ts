import { config } from '../../common/config';
import { TelegramUpdate } from '../updates/telegram.update';
import { DIALOGS } from '../../common/texts';
import { MyContext, MyConversation } from '../../common/utils';

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
    await ctx.reply(DIALOGS.OTHER.ADMIN);
  }
};
