import { prepareNDays, preparyTime } from '../../common/utils';
import { addDays, parse } from 'date-fns';
import { SignupsEnum } from '../../signups/enums/signups.enum';
import { Context, Keyboard } from 'grammy';
import { CONSTANTS } from '../../common/constants';
import { ru } from 'date-fns/locale';
import { menuKeyboard } from '../utility/telegramMenuUtility';
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
  const choose = async (ctx: MyContext) => {
    await ctx.reply('Выберите пункт из предложенных вариантов');
  };
  const cancelKeyboard = {
    reply_markup: {
      keyboard: [[{ text: 'Отмена' }]],
      one_time_keyboard: true,
      resize_keyboard: true,
    },
  };
  const allDays = await conversation.external(async () => {
    const result = [];
    let currDate = addDays(new Date(), 1);
    while (result.length < 3) {
      result.push(
        ...(await thisv2.signupsService.getDays(
          SignupsDuration[type],
          currDate,
        )),
      );
      currDate = addDays(currDate, 7);
    }
    return result.slice(0, 3);
  });
  const { days, words, keyboard: keyboardDays } = prepareNDays(allDays);

  await ctx.reply('Выберите день', {
    reply_markup: {
      keyboard: keyboardDays,
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
  const date = await conversation.form.select(words, choose);
  const allTimes = allDays.find(
    (elem) => elem.day === days.find((e) => e.word === date).day,
  );
  const { times, keyboard: keyboardTime } = preparyTime(
    allTimes.times.map((e) => e.date),
  );
  await ctx.reply(`Выберите время`, {
    reply_markup: {
      keyboard: keyboardTime,
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
  const time = await conversation.form.select(times, choose);
  const keyboard = new Keyboard()
    .requestContact('Поделиться телефоном')
    .text('Отмена');
  await ctx.reply(
    `Введите ваш номер телефона в международном формате\n+7XXXXXXXXXX`,
    {
      reply_markup: {
        keyboard: keyboard.build(),
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    },
  );
  const { msg } = await conversation.waitFor(
    ['message:contact', '::phone_number'],
    async (ctx: MyContext) => {
      await ctx.reply(
        'Введите номер телефона в международном формате\n+7XXXXXXXXXX',
      );
    },
  );
  const phone = msg.text ? msg.text : msg.contact.phone_number;
  await ctx.reply('Хотите добавить комментарий к встрече?', {
    reply_markup: {
      keyboard: [
        [{ text: 'Добавить комментарий' }],
        [{ text: 'Оставить поле пустым' }, { text: 'Отмена' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
  const addComment = await conversation.form.select(
    ['Добавить комментарий', 'Оставить поле пустым'],
    choose,
  );
  let text = '';
  if (addComment !== 'Оставить поле пустым') {
    await ctx.reply('Напишите комментарий к встрече', cancelKeyboard);
    text = await conversation.form.text((ctx: MyContext) =>
      ctx.reply('Введите ваш комментарий'),
    );
  }
  let resText = `Вы выбрали:\nВстреча: ${CONSTANTS[type]}\nДата: ${
    date.split(',')[0]
  }\nВремя: ${time}\nТелефон: ${phone}`;
  resText = text ? `${resText}\nКомментарий: ${text}` : resText;

  await ctx.reply(`${resText}\n\nВы подтверждаете?`, {
    reply_markup: {
      keyboard: [
        [{ text: 'Да' }, { text: 'Перезаписать' }, { text: 'Отмена' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
  const answer = await conversation.form.select(['Да', 'Перезаписать'], choose);
  switch (answer) {
    case 'Да': {
      const resTime = parse(
        `${date.split(',')[0]} ${time}`,
        'd MMMM kk:mm',
        new Date(),
        {
          locale: ru,
        },
      );
      const obj = {
        telegramId: ctx.from.id.toString(),
        date: resTime,
        type: SignupsEnum[type],
        duration: SignupsDuration[type],
        comment: text,
        phoneNumber: phone,
      };
      await conversation.external(async () => {
        if (await thisv2.signupsService.checkIfOK(obj)) {
          await ctx.reply(
            'К сожалению это время уже занято, попробуйте ещё раз',
            menuKeyboard,
          );
        } else {
          await thisv2.telegramService.sendRequest(obj);
          await ctx.reply('Ваша заявка была отправлена', menuKeyboard); //TEST
        }
      });
      return;
    }
    case 'Перезаписать': {
      return consDiagnostic(conversation, ctx, thisv2, type);
    }
  }
};
