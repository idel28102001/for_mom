import { TelegramUpdate } from '../updates/telegram.update';
import {
  choose,
  MyContext,
  MyConversation,
  prepareNDaysForOther,
  prepareNTimesForOther,
} from '../../common/utils';
import { DIALOGS } from '../../common/texts';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { menuKeyboard } from '../utility/telegramMenuUtility';
import { RolesEnum } from '../../users-center/enums/roles.enum';

const editMeeting = async (
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
  const { text, texts, forKeyboard } = await conversation.external(() =>
    thisv2.meetingsService.sendInfoToEdit(thatDay, meet, false),
  );
  await ctx.reply(text, {
    reply_markup: {
      keyboard: forKeyboard,
      resize_keyboard: true,
      one_time_keyboard: true,
    },
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
  const answer = await conversation.form.select(texts, choose);
  switch (answer) {
    case DIALOGS.MEETINGS.EDIT.EVENT.COMMENT: {
      const comment = await thisv2.textsService.AUSComment(ctx, conversation);
      await conversation.external(() =>
        thisv2.signupsService.editComment({
          meetingId: meet.id,
          comment,
        }),
      );
      await ctx.reply(DIALOGS.MEETINGS.CREATE.COMMENT.A1, menuKeyboard);
      return;
    }
    case DIALOGS.MEETINGS.EDIT.EVENT.PHONE_NUMBER: {
      const phoneNumber = await thisv2.textsService.AUSPhone(ctx, conversation);
      await conversation.external(() =>
        thisv2.usersCenterService.editPhoneNumber({
          telegramId: meet.user.telegramId,
          phoneNumber,
        }),
      );
      await ctx.reply(DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.A1, menuKeyboard);
      return;
    }
    case DIALOGS.MEETINGS.EDIT.EVENT.DATE: {
      const resDate = await thisv2.textsService.AUSDate(
        ctx,
        conversation,
        thisv2,
        meet,
      );
      const isNotOk = await conversation.external(() =>
        thisv2.signupsService.checkIfOK(
          {
            date: resDate,
            duration: meet.duration,
          },
          meet.id,
        ),
      );
      if (isNotOk) {
        await ctx.reply(DIALOGS.ERRORS.TRY, menuKeyboard);
        return;
      }
      await conversation.external(() =>
        thisv2.meetingsService.editMeeting({ date: resDate, meet }),
      );
      await ctx.reply(DIALOGS.MEETINGS.CREATE.DATE.A1, menuKeyboard);
      break;
    }
  }
};

export const editMeet = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
) => {
  const isAdmin = ctx.session.role === RolesEnum.ADMIN;
  if (isAdmin) {
    return await editMeeting(conversation, ctx, thisv2, true);
  } else {
    return await editMeeting(conversation, ctx, thisv2, false);
  }
};
