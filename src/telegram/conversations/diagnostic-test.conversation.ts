import { Context } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { TelegramUpdate } from '../updates/telegram.update';
import { SignupsDuration } from '../../signups/enums/signups.duration.enum';
import { SignupsEnum } from '../../signups/enums/signups.enum';

type MyConversation = Conversation<MyContext>;
type MyContext = Context & ConversationFlavor;

export const diagnosticTest = async (
  conversation: MyConversation,
  ctx: MyContext,
  thisv2: TelegramUpdate,
  type: SignupsEnum,
) => {
  // const s = await thisv2.signupsService.getDays(SignupsDuration.DIAGNOSTIC);
  // console.log(s);
  await ctx.reply('Мы в тесте');
  // if (true) {
  //   //TEST
  const obj = {
    //TEST
    telegramId: '5358876676', //TEST
    date: new Date('2022-10-21T06:00:00.000Z'), //TEST
    type, //TEST
    comment: '', //TEST
    phoneNumber: '+79780253725', //TEST
    duration: SignupsDuration[type],
  };
  await thisv2.tasksService.createEvent(
    {
      telegramId: obj.telegramId,
      date: obj.date,
      type: obj.type,
    },
    1,
  );
  //TEST
  // const { first_name, last_name, username } = ctx.from;
  // const name = `${last_name || ''} ${first_name || ''}`.trim();
  // await thisv2.googleService.makeCalendar({ ...obj, name, username });
  //   if (await thisv2.signupsService.checkIfOK(obj)) {
  //     await ctx.reply('К сожалению это время уже занято, попробуйте ещё раз');
  //   } else {
  //     await ctx.reply('Ваша заявка была отправлена', menuKeyboard); //TEST
  //   }
  // }
  //   return await thisv2.telegramService.sendRequest(obj); //TEST
  // } //TEST
  // const choose = async (ctx: MyContext) => {
  //   await ctx.reply('Выберите пункт из предложенных вариантов');
  // };
  // const cancelKeyboard = {
  //   reply_markup: {
  //     keyboard: [[{ text: 'Отмена' }]],
  //     one_time_keyboard: true,
  //     resize_keyboard: true,
  //   },
  // };
  //
  // const { days, keyboard: keyboardDays } = prepareNDays(
  //   3,
  //   addDays(new Date(), 1),
  // );
  //
  // await ctx.reply('Выберите день', {
  //   reply_markup: {
  //     keyboard: keyboardDays,
  //     resize_keyboard: true,
  //     one_time_keyboard: true,
  //   },
  // });
  // const date = (await conversation.form.select(days, choose)).split(',')[0];
  //
  // const { times, keyboard: keyboardTime } = preparyTime(SignupsEnum.DIAGNOSTIC);
  // await ctx.reply(`Выберите время`, {
  //   reply_markup: {
  //     keyboard: keyboardTime,
  //     resize_keyboard: true,
  //     one_time_keyboard: true,
  //   },
  // });
  // const time = await conversation.form.select(times, choose);
  // const keyboard = new Keyboard()
  //   .requestContact('Поделиться телефоном')
  //   .text('Отмена');
  // await ctx.reply(
  //   `Введите ваш номер телефона в международном формате\n+7XXXXXXXXXX`,
  //   {
  //     reply_markup: {
  //       keyboard: keyboard.build(),
  //       resize_keyboard: true,
  //       one_time_keyboard: true,
  //     },
  //   },
  // );
  // const { msg } = await conversation.waitFor(
  //   ['message:contact', '::phone_number'],
  //   async (ctx: MyContext) => {
  //     await ctx.reply(
  //       'Введите номер телефона в международном формате\n+7XXXXXXXXXX',
  //     );
  //   },
  // );
  // const phone = msg.text ? msg.text : msg.contact.phone_number;
  // await ctx.reply('Хотите добавить комментарий к встрече?', {
  //   reply_markup: {
  //     keyboard: [
  //       [{ text: 'Добавить комментарий' }],
  //       [{ text: 'Оставить поле пустым' }, { text: 'Отмена' }],
  //     ],
  //     resize_keyboard: true,
  //     one_time_keyboard: true,
  //   },
  // });
  // const addComment = await conversation.form.select(
  //   ['Добавить комментарий', 'Оставить поле пустым'],
  //   choose,
  // );
  // let text = '';
  // if (addComment !== 'Оставить поле пустым') {
  //   await ctx.reply('Напишите комментарий к встрече', cancelKeyboard);
  //   text = await conversation.form.text((ctx: MyContext) =>
  //     ctx.reply('Введите ваш комментарий'),
  //   );
  // }
  // let resText = `Вы выбрали:\nВстреча: ${Texts.DIAGNOSTIC}\nДата: ${date}\nВремя: ${time}\nТелефон: ${phone}`;
  // resText = text ? `${resText}\nКомментарий: ${text}` : resText;
  //
  // await ctx.reply(`${resText}\n\nВы подтверждаете?`, {
  //   reply_markup: {
  //     keyboard: [
  //       [{ text: 'Да' }, { text: 'Перезаписать' }, { text: 'Отмена' }],
  //     ],
  //     resize_keyboard: true,
  //     one_time_keyboard: true,
  //   },
  // });
  // const answer = await conversation.form.select(['Да', 'Перезаписать'], choose);
  // switch (answer) {
  //   case 'Да': {
  //     const resTime = parse(`${date} ${time}`, 'd MMMM kk:mm', new Date(), {
  //       locale: ru,
  //     });
  //     const obj = {
  //       telegramId: ctx.from.id.toString(),
  //       date: resTime,
  //       type: SignupsEnum.DIAGNOSTIC,
  //       duration: SignupsDurationEnum.DIAGNOSTIC,
  //       comment: text,
  //       phoneNumber: phone,
  //     };
  //     await thisv2.telegramService.sendRequest(obj);
  //     await ctx.reply('Ваша заявка была отправлена', menuKeyboard);
  //     return true;
  //   }
  //   case 'Перезаписать': {
  //     return diagnosticTest(conversation, ctx, thisv2);
  //   }
  // }
};
