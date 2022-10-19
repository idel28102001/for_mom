import { Inject, Injectable } from '@nestjs/common';
import { UsersCenterTokenEnum } from '../../users-center/enums/tokens/users-center.token.enum';
import { UsersCenterService } from '../../users-center/services/users-center.service';
import { SignupsService } from '../../signups/services/signups.service';
import { GoogleService } from '../../google/services/google.service';
import { SignupsTokenEnum } from '../../signups/enums/signups.token.enum';
import { GoogleTokenEnum } from '../../google/enums/google.token.enum';
import { TasksTokenEnum } from '../../tasks/enums/tokens/tasks.token.enum';
import { TasksService } from '../../tasks/services/tasks.service';
import { TextsTokenEnum } from '../../texts/enums/texts.token.enum';
import { TextsService } from '../../texts/services/texts.service';
import { SignupsEntity } from '../../signups/entities/signups.entity';
import { CANCEL, DIALOGS } from '../../common/constants';
import { MyContext, sliceIntoChunks } from '../../common/utils';
import { SignupsEnum } from '../../signups/enums/signups.enum';

@Injectable()
export class MeetingsService {
  constructor(
    @Inject(UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN)
    private readonly usersCenterService: UsersCenterService,
    @Inject(SignupsTokenEnum.SIGNUPS_SERVICES_TOKEN)
    private readonly signupsService: SignupsService,
    @Inject(GoogleTokenEnum.GOOGLE_SERVICES_TOKEN)
    private readonly googleService: GoogleService,
    @Inject(TasksTokenEnum.TASKS_SERVICES_TOKEN)
    private readonly tasksService: TasksService,
    @Inject(TextsTokenEnum.TEXTS_SERVICES_TOKEN)
    private readonly textsService: TextsService,
  ) {}

  async editMeeting({ date, meet }: { date: Date; meet: SignupsEntity }) {
    await this.signupsService.repo.update({ id: meet.id }, { date: meet.date });
    await this.googleService.editEvent({
      calendarEventId: meet.calendarEventId,
      date,
      duration: meet.duration,
    });
  }

  async createMeeting(obj: {
    ctx: MyContext;
    phoneNumber: string;
    date: Date;
    type: SignupsEnum;
    duration: number;
    comment: string;
  }) {
    const telegramId = obj.ctx.from.id.toString();
    const { last_name, username, first_name } = obj.ctx.from;
    const name = `${last_name || ''} ${first_name || ''}`.trim();
    await this.usersCenterService.savePhoneNumber(
      obj.ctx.from,
      obj.phoneNumber,
    );
    const eventId = await this.googleService.makeCalendar({
      ...obj,
      telegramId,
      name,
      username,
    });
    const user = await this.usersCenterService.repo
      .createQueryBuilder('U')
      .where('U.telegramId=:id', { id: telegramId })
      .select('U.id')
      .getOne();
    const signup = this.signupsService.createSign(
      { ...obj, calendarEventId: eventId },
      user,
    );
    await this.signupsService.repo.save(signup);
  }

  async deleteMeeting(meetingId: number) {
    const user = await this.signupsService.repo.findOne({
      where: { id: meetingId },
    });
    try {
      await this.googleService.deleteEvent(user.calendarEventId);
    } catch (e) {}
    await this.signupsService.repo.remove(user);
    return true;
  }

  async sendInfoToDelete(
    thatDay: string,
    meeting: SignupsEntity,
    isAdmin: boolean,
  ) {
    const texts = [
      DIALOGS.MEETINGS.CANCELATION.CONFIRM.Q,
      DIALOGS.MEETINGS.CANCELATION.CANCEL.Q,
    ];
    const text = this.textsService.prepareToDelete(thatDay, meeting, isAdmin);
    return { texts, text };
  }

  async sendInfoToEdit(
    thatDay: string,
    meeting: SignupsEntity,
    isAdmin: boolean,
  ) {
    const texts = Object.values(DIALOGS.MEETINGS.EDIT.EVENT);
    const text = this.textsService.prepareToEdit(thatDay, meeting, isAdmin);
    return {
      texts,
      forKeyboard: [
        ...sliceIntoChunks(
          texts.map((e) => ({ text: e })),
          2,
        ),
        [{ text: CANCEL }],
      ],
      text,
    };
  }
}
