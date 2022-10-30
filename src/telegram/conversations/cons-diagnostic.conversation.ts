import { formatPhone, prepareReply } from '../../common/utils';
import { parse } from 'date-fns';
import { SignupsEnum } from '../../signups/enums/signups.enum';
import { Context, Keyboard } from 'grammy';
import { CANCEL, DIALOGS, Texts } from '../../common/texts';
import { ru } from 'date-fns/locale';
import { confirmKeyboard, menuKeyboard } from '../utility/telegramMenuUtility';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { TelegramUpdate } from '../updates/telegram.update';
import { SignupsDuration } from '../../signups/enums/signups.duration.enum';

type MyConversation = Conversation<MyContext>;
type MyContext = Context & ConversationFlavor;

export const consDiagnostic = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
  type: SignupsEnum,
) => {
  const cancelKeyboard = {
    reply_markup: {
      keyboard: [[{ text: CANCEL }]],
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  };
  const { time, date } = await thisv2.textsService.getDate({
    conversation,
    ctx,
    thisv2,
    type,
  });
  const keyboard = new Keyboard()
    .requestContact(DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.SHARE)
    .text(CANCEL);
  const replyForPhone = {
    reply_markup: {
      keyboard: keyboard.build(),
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  };
  await ctx.reply(DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.ACTION(), replyForPhone);
  const { msg } = await conversation.waitFor(
    ['message:contact', '::phone_number'],
    async (ctx: MyContext) => {
      await ctx.reply(
        DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.ACTION(),
        replyForPhone,
      );
    },
  );
  const phoneNum = msg.text ? msg.text : msg.contact.phone_number;
  const phoneNumber = formatPhone(phoneNum);
  await ctx.reply(DIALOGS.MEETINGS.CREATE.COMMENT.Q1, {
    reply_markup: {
      keyboard: [
        [{ text: DIALOGS.MEETINGS.CREATE.COMMENT.KEYBOARD.TYPESMTH }],
        [
          { text: DIALOGS.MEETINGS.CREATE.COMMENT.KEYBOARD.EMPTY },
          { text: CANCEL },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
  const {
    msg: { text: addComment },
  } = await conversation.waitFor('message:text');
  let comment = '';
  switch (addComment) {
    case DIALOGS.MEETINGS.CREATE.COMMENT.KEYBOARD.EMPTY: {
      break;
    }
    case DIALOGS.MEETINGS.CREATE.COMMENT.KEYBOARD.TYPESMTH: {
      await ctx.reply('Напишите комментарий к встрече', cancelKeyboard);
      comment = await conversation.form.text((ctx: MyContext) =>
        ctx.reply(DIALOGS.MEETINGS.CREATE.COMMENT.ACTION),
      );
      break;
    }
    default: {
      comment = addComment;
    }
  }
  const cText = DIALOGS.MEETINGS.CREATE.ALL.WHOLE_TEXT;

  let resText = `${cText.P1}\n${cText.P2} ${Texts[type]}\n${cText.P3} ${
    date.split(' (')[0]
  }\n${cText.P4} ${time}\n${cText.P5} ${phoneNumber}`;
  resText = comment ? `${resText}\n${cText.P6} ${comment}` : resText;

  const answer = await prepareReply({
    ctx,
    conversation,
    keyboard: confirmKeyboard.reply_markup.keyboard,
    text: `${resText}\n\n${DIALOGS.CONFIRMATION.QUESTIONS.Q1}`,
  });
  switch (answer) {
    case DIALOGS.CONFIRMATION.KEYBOARD.CONFIRM: {
      const resDate = parse(
        `${date.split(' (')[0]} ${time}`,
        'd MMMM kk:mm',
        new Date(),
        {
          locale: ru,
        },
      );
      const obj = {
        ctx,
        telegramId: ctx.from.id.toString(),
        date: resDate,
        comment,
        type: SignupsEnum[type],
        duration: SignupsDuration[type],
        phoneNumber,
      };
      const isNotOk = await conversation.external(() =>
        thisv2.signupsService.checkIfOK(obj),
      );
      if (isNotOk) {
        await ctx.reply(DIALOGS.ERRORS.TRY, menuKeyboard(ctx));
        return;
      }
      const result = await conversation.external(async () => {
        return await thisv2.meetingsService
          .createMeeting(obj)
          .then((e) => 1)
          .catch((e) => 0);
      });
      if (result) {
        await ctx.reply(DIALOGS.MEETINGS.CREATE.ALL.A1, menuKeyboard(ctx)); //TEST
      } else {
        await ctx.reply(DIALOGS.ERRORS.MESSAGE, menuKeyboard(ctx));
      }
      return;
    }
    case DIALOGS.CONFIRMATION.KEYBOARD.REEDIT: {
      return consDiagnostic(conversation, ctx, thisv2, type);
    }
  }
};
