import { TelegramUpdate } from '../updates/telegram.update';
import {
  MyContext,
  MyConversation,
  prepareNDaysForOther,
  prepareNTimesForOther,
  prepareReply,
} from '../../common/utils';
import { CANCEL, DIALOGS } from '../../common/texts';
import { menuKeyboard } from '../utility/telegramMenuUtility';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { RolesEnum } from '../../users-center/enums/roles.enum';

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
    await ctx
      .reply(DIALOGS.MEETINGS.DAYS.A1, menuKeyboard(ctx))
      .catch(() => undefined);
    return;
  }
  let meetings = all[0].meetings;
  let thatDay = format(new Date(all[0].date), 'd MMMM (cccc)', { locale: ru });
  if (daysForKeyboard.length > 1) {
    const { daysForKeyboard, withTimes } = prepareNDaysForOther(all);
    thatDay = await prepareReply({
      ctx,
      conversation,
      keyboard: daysForKeyboard,
      text: DIALOGS.MEETINGS.DAYS.Q1,
    });

    meetings = withTimes.find((e) => e.text === thatDay).meetings;
  }

  let meet = meetings[0];
  if (meetings.length > 1) {
    const { times, withTimes } = prepareNTimesForOther(meetings);
    const answer = await prepareReply({
      ctx,
      conversation,
      keyboard: times,
      text: DIALOGS.MEETINGS.DAYS.Q2,
    });

    meet = withTimes.find((e) => e.text === answer).meeting;
  }
  const { text, texts } = await conversation.external(() =>
    thisv2.meetingsService.sendInfoToDelete(thatDay, meet, isAdmin),
  );
  const answer = await prepareReply({
    ctx,
    conversation,
    keyboard: [texts.map((e) => ({ text: e })), [{ text: CANCEL }]],
    addToOther: {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    },
    text,
  });

  if (answer === DIALOGS.MEETINGS.CANCELATION.CONFIRM.Q) {
    const result = await conversation.external(async () =>
      thisv2.meetingsService.deleteMeeting(meetings[0].id),
    );
    if (result) {
      await ctx
        .reply(DIALOGS.MEETINGS.CANCELATION.CONFIRM.A, menuKeyboard(ctx))
        .catch(() => undefined);
    } else {
      await ctx
        .reply(DIALOGS.ERRORS.MESSAGE, menuKeyboard(ctx))
        .catch(() => undefined);
    }
  } else {
    await ctx
      .reply(DIALOGS.MEETINGS.CANCELATION.CANCEL.A, menuKeyboard(ctx))
      .catch(() => undefined);
  }
};

export const cancelMeet = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
) => {
  const isAdmin = ctx.session.role === RolesEnum.ADMIN;
  if (isAdmin) {
    return await cancel(conversation, ctx, thisv2, true);
  } else {
    return await cancel(conversation, ctx, thisv2, false);
  }
};
