import { config } from '../../common/config';
import { TelegramUpdate } from '../updates/telegram.update';
import { DIALOGS } from '../../common/texts';
import { MyContext, MyConversation } from '../../common/utils';
import { RolesEnum } from '../../users-center/enums/roles.enum';

export const makeMeAdmin = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
) => {
  const ctx2 = await conversation.waitFor(':text');
  if (ctx2.msg.text === config.getSecret) {
    await conversation.external(async () => {
      await thisv2.usersCenterService.makeAdmin(ctx.from.id.toString());
    });
    ctx2.session.role = RolesEnum.ADMIN;
    await ctx.reply(DIALOGS.OTHER.ADMIN);
  }
};
