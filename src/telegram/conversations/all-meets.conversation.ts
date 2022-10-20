import { TelegramUpdate } from '../updates/telegram.update';
import {
  choose,
  MyContext,
  MyConversation,
  prepareNDaysForOther,
} from '../../common/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { DIALOGS } from '../../common/texts';
import { RolesEnum } from '../../users-center/enums/roles.enum';

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
      await ctx.reply(DIALOGS.MEETINGS.DAYS.A1);
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
      const { daysForKeyboard, words, withTimes } = prepareNDaysForOther(all);
      await ctx.reply(DIALOGS.MEETINGS.DAYS.Q1, {
        reply_markup: {
          keyboard: daysForKeyboard,
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      const thatDay = await conversation.form.select(words, choose);
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
