import { Inject, Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Keyboard } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';
import { prepareNDays, preparyTime } from '../../common/utils';
import { addDays, parse } from 'date-fns';
import { SignupsEnum } from '../../signups/enums/signups.enum';
import { CONSTANTS } from '../../common/constants';
import { ru } from 'date-fns/locale';
import { menuKeyboard } from '../utility/telegramMenuUtility';

type MyContext = Context & ConversationFlavor;
type MyConversation = Conversation<MyContext>;

@Injectable()
export class TelegramService {
  constructor(
    @InjectBot() private readonly bot,
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    private readonly usersCenterService: UsersCenterService,
  ) {}
  async diagnostic(conversation: MyConversation, ctx: MyContext) {
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

    const { days, keyboard: keyboardDays } = prepareNDays(
      3,
      addDays(new Date(), 1),
    );

    await ctx.reply('Выберите день', {
      reply_markup: {
        keyboard: keyboardDays,
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    const date = (await conversation.form.select(days, choose)).split(',')[0];

    const { times, keyboard: keyboardTime } = preparyTime(
      SignupsEnum.DIAGNOSTIC,
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
    let text;
    if (addComment !== 'Оставить поле пустым') {
      await ctx.reply('Напишите комментарий к встрече', cancelKeyboard);
      text = await conversation.form.text((ctx: MyContext) =>
        ctx.reply('Введите ваш комментарий'),
      );
    }
    let resText = `Вы выбрали:\nВстреча: ${CONSTANTS.DIAGNOSTIC}\nДата: ${date}\nВремя: ${time}\nТелефон: ${phone}`;
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
    const answer = await conversation.form.select(
      ['Да', 'Перезаписать'],
      choose,
    );
    switch (answer) {
      case 'Да': {
        const resTime = parse(`${date} ${time}`, 'd MMMM kk:mm', new Date(), {
          locale: ru,
        });
        await ctx.reply('Ваша заявка была отправлена', menuKeyboard);
        return true;
      }
      case 'Перезаписать': {
        return this.diagnostic(conversation, ctx);
      }
    }
  }
}
