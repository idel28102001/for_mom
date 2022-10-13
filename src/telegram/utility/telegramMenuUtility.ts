import { Context } from 'grammy';

export const menuKeyboard = {
  reply_markup: {
    keyboard: [[{ text: 'Диагностика' }, { text: 'Консультация' }]],
    resize_keyboard: true,
  },
};

export const telegramMenuUtility = async (ctx: Context) => {
  await ctx.reply('Выбери услугу', menuKeyboard);
};
