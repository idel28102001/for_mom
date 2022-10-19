import { format } from 'date-fns';

import { SignupsEntity } from '../signups/entities/signups.entity';
import { ru } from 'date-fns/locale';
import { Context } from 'grammy';
import { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import { CANCEL } from './constants';

export type MyConversation = Conversation<MyContext>;
export type MyContext = Context & ConversationFlavor;

export const sliceIntoChunks = <T>(
  arr: Array<T>,
  chunkSize: number,
): Array<Array<T>> => {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
};

export const prepareNDays = (
  allDays: { day: string; times: { date: Date }[] }[],
) => {
  const days = allDays.map((e) => ({
    day: e.day,
    word: format(new Date(e.day), 'd MMMM (cccc)', { locale: ru }),
  }));
  const words = days.map((e) => e.word);
  const all = words.map((e) => ({ text: e }));
  return {
    days,
    words,
    keyboard: [
      ...sliceIntoChunks<{ text: string }>(all, 3),
      [{ text: CANCEL }],
    ],
  };
};

export const choose = async (ctx: MyContext) => {
  await ctx.reply('Выберите пункт из предложенных вариантов');
};

export const generateWhatsappLink = (phone: string) => {
  return `https://api.whatsapp.com/send?phone=${phone.slice(
    1,
  )}&text=Привет%2C у нас с тобой сейчас консультация`;
};

export const prepareNDaysForOther = (
  allDays: Array<{
    date: string;
    meetings: SignupsEntity[];
  }>,
) => {
  const withTimes = allDays.map((e) => ({
    text: format(new Date(e.date), 'd MMMM (cccc)', { locale: ru }),
    meetings: e.meetings,
  }));
  const words = withTimes.map((e) => e.text);
  return {
    daysForKeyboard: [
      ...sliceIntoChunks<{ text: string }>(withTimes, 3),
      [{ text: CANCEL }],
    ],
    words,
    withTimes,
  };
};

export const prepareNTimesForOther = (allDays: Array<SignupsEntity>) => {
  const withTimes = allDays.map((e) => ({
    text: format(new Date(e.date), 'kk:mm', { locale: ru }),
    meeting: e,
  }));
  const words = withTimes.map((e) => e.text);
  return {
    times: [
      ...sliceIntoChunks<{ text: string }>(withTimes, 4),
      [{ text: CANCEL }],
    ],
    words,
    withTimes,
  };
};

export const preparyTime = (timeArray: Array<Date>) => {
  const times = timeArray.map((e) => format(e, 'kk:mm'));
  const all = times.map((e) => ({ text: e }));
  const keyboard = sliceIntoChunks<{ text: string }>(all, 6);
  keyboard.push([{ text: CANCEL }]);
  return { times, keyboard };
};
