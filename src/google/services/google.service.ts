import { Injectable } from '@nestjs/common';
import { SignupsEnum } from '../../signups/enums/signups.enum';
import { google } from 'googleapis';
import { config } from '../../common/config';
import { addMinutes } from 'date-fns';
import { DIALOGS, Texts } from '../../common/texts';

@Injectable()
export class GoogleService {
  auth;
  calendar;

  constructor() {
    this.calendar = google.calendar({ version: 'v3' });
    const CREDENTIALS = config.getCredentials;
    this.auth = new google.auth.JWT(
      CREDENTIALS.client_email,
      null,
      CREDENTIALS.private_key,
      config.getScopes,
    );
  }

  async editEvent({ calendarEventId, date, duration }) {
    const { data } = await this.calendar.events.get({
      auth: this.auth,
      calendarId: config.calendarId,
      eventId: calendarEventId,
    });
    await this.calendar.events.update({
      auth: this.auth,
      calendarId: config.calendarId,
      eventId: calendarEventId,
      requestBody: {
        ...data,
        start: {
          dateTime: date,
          timeZone: 'Europe/Moscow',
        },
        end: {
          dateTime: addMinutes(date, duration),
          timeZone: 'Europe/Moscow',
        },
      },
    });
  }

  async deleteEvent(id: string) {
    await this.calendar.events.delete({
      auth: this.auth,
      calendarId: config.calendarId,
      eventId: id,
    });
  }

  async makeCalendar(obj: {
    telegramId: string;
    phoneNumber: string;
    comment: string;
    username: string;
    name: string;
    date: Date;
    duration: number;
    type: SignupsEnum;
  }) {
    const toG = DIALOGS.MEETINGS.CREATE.ALL.TO_GOOGLE;
    const event = {
      summary: `${Texts[obj.type]} ${toG.P9} ${obj.name}(@${obj.username})`,
      description: `${toG.P8}: ${obj.phoneNumber}\n${toG.P6}: ${
        obj.comment || toG.P7
      }`,
      start: {
        dateTime: obj.date,
        timeZone: 'Europe/Moscow',
      },
      end: {
        dateTime: addMinutes(obj.date, obj.duration),
        timeZone: 'Europe/Moscow',
      },
      reminders: {
        useDefault: false,
        overrides: [{ method: 'popup', minutes: 10 }],
      },
    };

    return await this.insertEvent(event);
  }

  async insertEvent(event) {
    try {
      const response = await this.calendar.events.insert({
        auth: this.auth,
        calendarId: config.calendarId,
        resource: event,
      });

      if (response['status'] == 200 && response['statusText'] === 'OK') {
        return response.data.id;
      } else {
        return 0;
      }
    } catch (error) {
      console.log(`Error at insertEvent --> ${error}`);
      return 0;
    }
  }
}
