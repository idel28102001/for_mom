import { TelegramUpdate } from '../updates/telegram.update';
import {
  choose,
  MyContext,
  MyConversation,
  prepareNDaysForOther,
  prepareNTimesForOther,
} from '../../common/utils';
import { CANCEL, DIALOGS } from '../../common/constants';
import { menuKeyboard } from '../utility/telegramMenuUtility';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const cancel = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
  isAdmin: boolean,
) => {
  const { daysForKeyboard, all } = await conversation.external(async () => {
    return await thisv2.signupsService.getAll(isAdmin, ctx.from.id.toString());
  });
  if (daysForKeyboard.length === 0) {
    await ctx.reply(DIALOGS.MEETINGS.DAYS.A1);
    return;
  }
  let meetings = all[0].meetings;
  let thatDay = format(new Date(all[0].date), 'd MMMM (cccc)', { locale: ru });
  if (daysForKeyboard.length > 1) {
    const { daysForKeyboard, words, withTimes } = prepareNDaysForOther(all);
    await ctx.reply(DIALOGS.MEETINGS.DAYS.Q1, {
      reply_markup: {
        keyboard: daysForKeyboard,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    thatDay = await conversation.form.select(words, choose);
    meetings = withTimes.find((e) => e.text === thatDay).meetings;
  }

  let meet = meetings[0];
  if (meetings.length > 1) {
    const { times, words, withTimes } = prepareNTimesForOther(meetings);
    await ctx.reply(DIALOGS.MEETINGS.DAYS.Q2, {
      reply_markup: {
        keyboard: times,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    const answer = await conversation.form.select(words, choose);
    meet = withTimes.find((e) => e.text === answer).meeting;
  }
  const { text, texts } = await conversation.external(() =>
    thisv2.meetingsService.sendInfoToDelete(thatDay, meet, isAdmin),
  );
  await ctx.reply(text, {
    reply_markup: {
      keyboard: [texts.map((e) => ({ text: e })), [{ text: CANCEL }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
  const answer = await conversation.form.select(texts, choose);
  if (answer === DIALOGS.MEETINGS.CANCELATION.CONFIRM.Q) {
    const result = await conversation.external(async () =>
      thisv2.meetingsService.deleteMeeting(meetings[0].id),
    );
    if (result) {
      await ctx.reply(DIALOGS.MEETINGS.CANCELATION.CONFIRM.A, menuKeyboard);
    } else {
      await ctx.reply(DIALOGS.ERRORS.MESSAGE, menuKeyboard);
    }
  } else {
    await ctx.reply(DIALOGS.MEETINGS.CANCELATION.CANCEL.A, menuKeyboard);
  }
};

export const cancelMeet = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
) => {
  const isAdmin = await conversation.external(async () => {
    return await thisv2.telegramService.ifAdmin(ctx);
  });
  if (isAdmin) {
    return await cancel(conversation, ctx, thisv2, true);
  } else {
    return await cancel(conversation, ctx, thisv2, false);
  }
};
