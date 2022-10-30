import { CANCEL, DIALOGS, Texts } from '../../common/texts';
import { MyContext } from '../../common/utils';
import { RolesEnum } from '../../users-center/enums/roles.enum';

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

export const menuKeyboard = (ctx: MyContext) => {
  const allMeets = [
    [{ text: Texts.DIAGNOSTIC }, { text: Texts.CONSULTATION }],
    [{ text: Texts.EDIT }, { text: Texts.CANCEL }],
    [{ text: Texts.SHOW }],
  ];
  if (ctx.session.role === RolesEnum.ADMIN) {
    allMeets.push([{ text: Texts.TECHNICS }]);
  }
  return {
    reply_markup: {
      keyboard: allMeets,
      resize_keyboard: true,
    },
  };
};

export const telegramMenuUtility = async (ctx: MyContext) => {
  await ctx.reply('Выбери услугу', menuKeyboard(ctx));
};
