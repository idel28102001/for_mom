import { Context } from 'grammy';
import { CANCEL, DIALOGS, Texts } from '../../common/texts';

export const confirmKeyboard = {
  reply_markup: {
    keyboard: [
      [
        { text: DIALOGS.CONFIRMATION.KEYBOARD.CONFIRM },
        { text: DIALOGS.CONFIRMATION.KEYBOARD.REEDIT },
        { text: CANCEL },
      ],
    ],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

export const menuKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: Texts.DIAGNOSTIC }, { text: Texts.CONSULTATION }],
      [{ text: Texts.EDIT }, { text: Texts.CANCEL }],
      [{ text: Texts.SHOW }],
    ],
    resize_keyboard: true,
  },
};

export const telegramMenuUtility = async (ctx: Context) => {
  await ctx.reply('Выбери услугу', menuKeyboard);
};
