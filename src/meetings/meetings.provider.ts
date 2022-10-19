import { Provider } from '@nestjs/common';
import { MeetingsTokenEnum } from './enums/meetings.token.enum';
import { MeetingsService } from './services/meetings.service';

export const MeetingsProvider: Provider[] = [
  {
    provide: MeetingsTokenEnum.MEETINGS_SERVICES_TOKEN,
    useClass: MeetingsService,
  },
];
