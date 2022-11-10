import { TelegramUpdate } from '../updates/telegram.update';
import {
  MyContext,
  MyConversation,
  prepareNDaysForOther,
  prepareReply,
} from '../../common/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DIALOGS } from '../../common/texts';
import { RolesEnum } from '../../users-center/enums/roles.enum';
import { menuKeyboard } from '../utility/telegramMenuUtility';

const allMeetings = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
  isAdmin: boolean,
) => {
  const { daysForKeyboard, all } = await conversation.external(async () => {
    return await thisv2.signupsService.getAll(isAdmin, ctx.from.id.toString());
  });
  switch (daysForKeyboard.length) {
    case 0: {
      await ctx
        .reply(DIALOGS.MEETINGS.DAYS.A1, menuKeyboard(ctx))
        .catch(() => undefined);
      break;
    }
    case 1: {
      await conversation.external(async () => {
        await thisv2.telegramService.sendMeetingsInfo(
          format(new Date(daysForKeyboard[0]), 'd MMMM (cccc)', { locale: ru }),
          all[0].meetings,
          ctx,
          isAdmin,
        );
      });
      break;
    }
    default: {
      const { daysForKeyboard, withTimes } = prepareNDaysForOther(all);
      const thatDay = await prepareReply({
        ctx,
        conversation,
        keyboard: daysForKeyboard,
        text: DIALOGS.MEETINGS.DAYS.Q1,
      });
      const meetings = withTimes.find((e) => e.text === thatDay).meetings;
      await conversation.external(async () => {
        await thisv2.telegramService.sendMeetingsInfo(
          thatDay,
          meetings,
          ctx,
          isAdmin,
        );
      });
    }
  }
};

export const allMeets = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
) => {
  const isAdmin = ctx.session.role === RolesEnum.ADMIN;
  if (isAdmin) {
    return await allMeetings(conversation, ctx, thisv2, true);
  } else {
    return await allMeetings(conversation, ctx, thisv2, false);
  }
};
