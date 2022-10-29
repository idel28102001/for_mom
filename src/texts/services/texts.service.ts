import { Injectable } from '@nestjs/common';
import { SignupsEntity } from '../../signups/entities/signups.entity';
import { addDays, format, parse, subMinutes } from 'date-fns';
import { CANCEL, DIALOGS, Texts } from '../../common/texts';
import {
  choose,
  formatPhone,
  generateWhatsappLink,
  MyContext,
  MyConversation,
  prepareNDays,
  prepareReply,
  preparyTime,
} from '../../common/utils';
import { confirmKeyboard } from '../../telegram/utility/telegramMenuUtility';
import { Keyboard } from 'grammy';
import { SignupsDuration } from '../../signups/enums/signups.duration.enum';
import { TelegramUpdate } from '../../telegram/updates/telegram.update';
import { SignupsEnum } from '../../signups/enums/signups.enum';
import { ru } from 'date-fns/locale';
import { SignupsNamesEnum } from '../../signups/enums/signups-names.enum';

@Injectable()
export class TextsService {
  async getDate(
    {
      conversation,
      ctx,
      thisv2,
      type,
    }: {
      conversation: MyConversation;
      ctx: MyContext;
      thisv2: TelegramUpdate;
      type: SignupsEnum;
    },
    dateToFilter = subMinutes(new Date(), 30),
  ) {
    const allDays = await conversation.external(async () => {
      const result: Array<{ day: string; times: Array<{ date: Date }> }> = [];
      let currDate = addDays(new Date(), 1);
      while (result.length < 7) {
        result.push(
          ...(await thisv2.signupsService.getDays(
            SignupsDuration[type],
            currDate,
            dateToFilter,
          )),
        );
        currDate = addDays(currDate, 7);
      }
      return result.slice(0, 7);
    });
    const { days, keyboard: keyboardDays } = prepareNDays(allDays);
    const date = await prepareReply({
      ctx,
      conversation,
      text: DIALOGS.MEETINGS.CREATE.DATE.DAY,
      keyboard: keyboardDays,
    });
    const allTimes = allDays.find(
      (elem) => elem.day === days.find((e) => e.word === date).day,
    );
    const { keyboard: keyboardTime } = preparyTime(
      allTimes.times.map((e) => e.date),
    );
    const time = await prepareReply({
      ctx,
      conversation,
      text: DIALOGS.MEETINGS.CREATE.DATE.TIME,
      keyboard: keyboardTime,
    });
    return { date, time };
  }

  async AUSDate(
    ctx: MyContext,
    conversation: MyConversation,
    thisv2: TelegramUpdate,
    meet: SignupsEntity,
  ) {
    const { time, date } = await thisv2.textsService.getDate(
      {
        conversation,
        ctx,
        thisv2,
        type: meet.type,
      },
      meet.date,
    );
    const resDate = parse(
      `${date.split(' (')[0]} ${time}`,
      'd MMMM kk:mm',
      new Date(),
      {
        locale: ru,
      },
    );
    const text = `${DIALOGS.MEETINGS.CREATE.DATE.S1} ${
      date.split(' (')[0]
    }\n\n${DIALOGS.CONFIRMATION.QUESTIONS.Q1}`;
    await ctx.reply(text, confirmKeyboard);
    const answer = await conversation.form.select(
      Object.values(DIALOGS.CONFIRMATION.KEYBOARD),
      choose,
    );
    switch (answer) {
      case DIALOGS.CONFIRMATION.KEYBOARD.CONFIRM: {
        return resDate;
      }
      case DIALOGS.CONFIRMATION.KEYBOARD.REEDIT: {
        return this.AUSDate(ctx, conversation, thisv2, meet);
      }
    }
  }

  async AUSComment(ctx: MyContext, conversation: MyConversation) {
    await ctx.reply(DIALOGS.MEETINGS.CREATE.COMMENT.ACTION);
    const comment = await conversation.form.text();
    const text = `${DIALOGS.MEETINGS.CREATE.COMMENT.S1} ${comment}\n\n${DIALOGS.CONFIRMATION.QUESTIONS.Q1}`;
    await ctx.reply(text, confirmKeyboard);
    const answer = await conversation.form.select(
      Object.values(DIALOGS.CONFIRMATION.KEYBOARD),
      choose,
    );
    switch (answer) {
      case DIALOGS.CONFIRMATION.KEYBOARD.CONFIRM: {
        return comment;
      }
      case DIALOGS.CONFIRMATION.KEYBOARD.REEDIT: {
        return this.AUSComment(ctx, conversation);
      }
    }
  }

  async AUSPhone(ctx: MyContext, conversation: MyConversation) {
    const keyboard = new Keyboard()
      .requestContact(DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.SHARE)
      .text(CANCEL);
    await ctx.reply(DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.ACTION(), {
      reply_markup: {
        keyboard: keyboard.build(),
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
    const { msg } = await conversation.waitFor(
      ['message:contact', '::phone_number'],
      async (ctx: MyContext) => {
        await ctx.reply(DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.ACTION());
      },
    );
    const phoneNumber = msg.text ? msg.text : msg.contact.phone_number;
    const text = `${DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.S1} ${phoneNumber}\n\n${DIALOGS.CONFIRMATION.QUESTIONS.Q1}`;
    await ctx.reply(text, confirmKeyboard);
    const answer = await conversation.form.select(
      Object.values(DIALOGS.CONFIRMATION.KEYBOARD),
      choose,
    );
    switch (answer) {
      case DIALOGS.CONFIRMATION.KEYBOARD.CONFIRM: {
        return phoneNumber;
      }
      case DIALOGS.CONFIRMATION.KEYBOARD.REEDIT: {
        return this.AUSPhone(ctx, conversation);
      }
    }
  }

  prepareToDelete(thatDay: string, obj: SignupsEntity, isAdmin: boolean) {
    return (
      `<b>${thatDay}</b>\n` +
      this.prepareBasic(thatDay, obj, isAdmin) +
      `\n\n\n<b>${DIALOGS.MEETINGS.CANCELATION.AUS.Q}</b>`
    );
  }

  prepareToEdit(thatDay: string, obj: SignupsEntity, isAdmin: boolean) {
    return (
      `<b>${thatDay}</b>\n` +
      this.prepareBasic(thatDay, obj, isAdmin) +
      `\n\n\n<b>${DIALOGS.MEETINGS.EDIT.AUS.Q}</b>`
    );
  }

  prepareBasic(thatDay: string, obj: SignupsEntity, isAdmin: boolean) {
    obj.user.phoneNumber = formatPhone(obj.user.phoneNumber);
    const toG = DIALOGS.MEETINGS.CREATE.ALL.TO_GOOGLE;
    const nickname = obj.user.username
      ? `${toG.P1}: @${obj.user.username}\n`
      : `${toG.P1}: <a href="tg://user?id=${obj.user.telegramId}">Написать</a>\n`;
    let name = `${obj.user.firstname ? obj.user.firstname + ' ' : ''}${
      obj.user.lastname ? obj.user.lastname : ''
    }`.trim();
    name = name ? `${toG.P2}: ${name}\n` : '';
    const whatsapp = `${toG.P10}: <a href="${generateWhatsappLink(
      obj.user.phoneNumber,
      SignupsNamesEnum[obj.type],
    )}">${toG.P3}</a>`;
    const time = format(obj.date, 'kk:mm');
    return `${toG.P4}: <b>${time}</b>\n${toG.P5}: ${Texts[obj.type]}\n${
      (isAdmin && name) || ''
    }${toG.P6}: ${obj.comment || toG.P7}\n${toG.P8}: <a>${
      obj.user.phoneNumber
    }</a>\n${(isAdmin && nickname) || ''}${(isAdmin && whatsapp) || ''}`;
  }

  prepareText(thatDay: string, array: Array<SignupsEntity>, isAdmin: boolean) {
    return (
      `<b>${thatDay}</b>\n\n` +
      array
        .map((e) => {
          return this.prepareBasic(thatDay, e, isAdmin);
        })
        .join('\n\n\n')
    );
  }
}
