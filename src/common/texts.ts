import { subHours, subMinutes } from 'date-fns';

export enum Texts {
  CONSULTATION = '💎Консультация💎',
  DIAGNOSTIC = '💫Диагностика💫',
  EDIT = '✏Изменить встречу✏',
  CANCEL = '🚫Отменить встречу🚫',
  SHOW = '📅Текущие встречи📅',
  TECHNICS = '🛠Техническая часть🛠',
}

export const CANCEL = 'Отмена';

export const DIALOGS = {
  OTHER: {
    ADMIN: 'Теперь вы админ',
    CHOOSE: 'Выберите пункт из предложенных вариантов',
  },
  CONFIRMATION: {
    KEYBOARD: { CONFIRM: 'Подтвердить', REEDIT: 'Перезаписать' },
    QUESTIONS: { Q1: 'Вы подтверждаете?' },
  },
  ERRORS: {
    MESSAGE: 'Произошла ошибка, попробуйте ещё раз',
    TRY: 'К сожалению это время уже занято, попробуйте ещё раз',
  },
  MEETINGS: {
    FOR_LINK: { A1: 'Привет,+у+нас+с+тобой+сейчас' },
    FUTURE: {
      A1: 'у вас состоится',
      A2: 'Завтра',
      A3: 'Сегодня',
      A4: 'в',
      A5: {
        date(date: Date) {
          return subHours(date, 2);
        },
        text: 'Через 2 часа',
      },
      A6: {
        date(date: Date) {
          return subMinutes(date, 15);
        },
        text: 'Через 15 минут',
      },
    },
    DAYS: {
      A1: 'Пока у вас нет встреч',
      Q1: 'Выберите день встреч',
      Q2: 'Выберите время',
    },
    CANCELATION: {
      AUS: { Q: 'Вы точно хотите отменить?' },
      CONFIRM: { Q: 'Да, отменить встречу', A: 'Вы успешно отменили встречу' },
      CANCEL: { Q: 'Нет, оставить встречу', A: 'Встреча всё ещё в силе' },
    },
    EDIT: {
      AUS: { Q: 'Что вы хотите изменить?' },
      EVENT: {
        COMMENT: '✏Комментарий✏',
        PHONE_NUMBER: '📞Номер телефона📞',
        DATE: '📅Дату/время встречи📅',
      },
    },
    CREATE: {
      DATE: {
        DAY: 'Выберите день',
        TIME: `Выберите время`,
        A1: 'Встреча успешно перенесена',
        S1: 'Вы выбрали:',
      },
      PHONE_NUMBER: {
        SHARE: 'Поделиться телефоном',
        ACTION: () => {
          const text = (this as any).DIALOGS.MEETINGS.CREATE.PHONE_NUMBER.SHARE;
          return `Поделитесь телефоном через кнопку "${text}" \nИли введите ваш номер телефона в международном формате +7XXXXXXXXXX`;
        },

        S1: 'Вы ввели:',
        A1: 'Номер телефона успешно обновлён',
      },
      COMMENT: {
        KEYBOARD: {
          EMPTY: 'Оставить поле пустым',
          TYPESMTH: 'Добавить комментарий',
        },
        ACTION: 'Введите ваш комментарий',
        S1: 'Вы ввели:',
        A1: 'Комментарий успешно обновлён',
        Q1: 'Хотите добавить комментарий к встрече?',
      },
      ALL: {
        A1: 'Ваша заявка была отправлена. Незадолго до встречи вам придёт уведомление',
        TO_GOOGLE: {
          P1: 'Telegram',
          P2: 'Имя',
          P3: 'Написать',
          P4: 'Время',
          P5: 'Встреча',
          P6: 'Комментарий',
          P7: 'Не оставляли',
          P8: 'Телефон',
          P9: 'с',
          P10: 'Whatsapp',
        },
        WHOLE_TEXT: {
          P1: 'Вы выбрали:',
          P2: 'Встреча:',
          P3: 'Дата:',
          P4: 'Время:',
          P5: 'Телефон:',
          P6: 'Комментарий:',
        },
      },
    },
  },
};
