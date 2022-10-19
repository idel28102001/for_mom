import { Context } from 'grammy';
import { CANCEL, CONSTANTS, DIALOGS } from '../../common/constants';

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
      [{ text: CONSTANTS.DIAGNOSTIC }, { text: CONSTANTS.CONSULTATION }],
      [{ text: CONSTANTS.EDIT }, { text: CONSTANTS.CANCEL }],
      [{ text: CONSTANTS.SHOW }],
    ],
    resize_keyboard: true,
  },
};

export const telegramMenuUtility = async (ctx: Context) => {
  await ctx.reply('Выбери услугу', menuKeyboard);
};
