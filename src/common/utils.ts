import {
  addDays,
  addMinutes,
  compareAsc,
  format,
  getYear,
  isWithinInterval,
  setHours,
  subMinutes,
} from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { SignupsEnum } from '../signups/enums/signups.enum';
import { SignupsEntity } from '../signups/entities/signups.entity';
import { ru } from 'date-fns/locale';

const months = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const sliceIntoChunks = <T>(
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

const makeMoscow = (...args) => {
  return utcToZonedTime(new Date(args as any), 'Europe/Moscow');
};

export const getMainDate = (date: Date) => {
  return format(makeMoscow(date), 'yyyy-MM-dd');
};

export const getMainTime = (date: Date) => {
  return format(makeMoscow(date), 'HH:mm');
};

export const orderTimes = (times: Array<string>) => {
  return times.sort((a, b) => {
    const aa = makeMoscow(`${getMainDate(new Date())} ${a}`);
    const bb = makeMoscow(`${getMainDate(new Date())} ${b}`);
    return compareAsc(aa, bb);
  });
};

export const orderEntTimes = (times: Array<SignupsEntity>) => {
  return times.sort((a, b) => {
    const aa = makeMoscow(a.date);
    const bb = makeMoscow(b.date);
    return compareAsc(aa, bb);
  });
};
export const getInterval = (
  nextDiap: SignupsEnum,
  previousDiap: SignupsEnum,
  time: string,
) => {
  const first = makeMoscow(`${getMainDate(new Date())} ${time}`);
  const add = nextDiap === SignupsEnum.CONSULTATION ? 29 : 89;
  const sub = previousDiap === SignupsEnum.CONSULTATION ? 29 : 89;
  const end = addMinutes(first, add);
  const start = subMinutes(first, sub);
  return { start, end };
};

export const getTimes = (
  type: SignupsEnum,
  filters = [],
  etc: SignupsEntity[],
) => {
  const date = utcToZonedTime(getMainDate(new Date()), 'Europe/Moscow');
  const allTimes = [];
  const filts = filters.map((e) => getInterval(type, type, e));
  const etcFilters = etc.map((e) =>
    getInterval(e.type, type, getMainTime(e.date)),
  );
  const sessionTime = type === SignupsEnum.DIAGNOSTIC ? 30 : 90;
  let startTime = setHours(date, 8);
  const endTime = subMinutes(setHours(date, 20), sessionTime);
  while (compareAsc(startTime, endTime) !== 1) {
    const curr = filts.some((e) =>
      isWithinInterval(startTime, { end: e.end, start: e.start }),
    );
    const second = etcFilters.some((e) =>
      isWithinInterval(startTime, { end: e.end, start: e.start }),
    );
    if (curr || second) {
      startTime = addMinutes(startTime, 30);
      continue;
    }
    allTimes.push(getMainTime(startTime));
    startTime = addMinutes(startTime, 30);
  }
  return allTimes;
};

export const createKeyboard = (elems) => {
  const result = [];
  const process = [];
  for (let i = 0; i < elems.length; i++) {
    process.push({ text: elems[i] });
    if (process.length === 4 || elems.length - 1 === i) {
      result.push([...process]);
      process.length = 0;
    }
  }
  return result;
};

export const getDateFromDays = (day: string, date: Date) => {
  const result = /(?<day>\d+) (?<month>[а-я]+)/g.exec(day).groups;
  const month = months.indexOf(result.month) + 2;
  return makeMoscow(getYear(date), month, Number(result.day));
};

export const getNDays = (daysCount: number, startDate: Date) => {
  const emptyArray = [];
  for (let i = 0; i < daysCount; i++) {
    const currDate = addDays(startDate, i);
    emptyArray.push(format(currDate, 'd MMMM, (cccc)', { locale: ru }));
  }
  return emptyArray;
};

export const prepareNDays = (daysCount: number, startDate: Date) => {
  const days = getNDays(daysCount, startDate);
  days.push('Отмена');
  const all = days.map((e) => ({ text: e }));
  return { days, keyboard: sliceIntoChunks<{ text: string }>(all, 2) };
};

export const preparyTime = (type: SignupsEnum) => {
  const times = getTimes(type, [], []);
  const all = times.map((e) => ({ text: e }));
  const keyboard = sliceIntoChunks<{ text: string }>(all, 6);
  keyboard.push([{ text: 'Отмена' }]);
  return { times, keyboard };
};
