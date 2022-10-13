import { Provider } from '@nestjs/common';
import { TelegramTokenEnum } from './enums/tokens/telegram.token.enum';
import { TelegramUpdate } from './updates/telegram.update';
import { TelegramService } from './services/telegram.service';

export const TelegramProvider: Provider[] = [
  {
    provide: TelegramTokenEnum.TELEGRAM_UPDATE_TOKEN,
    useClass: TelegramUpdate,
  },
  {
    provide: TelegramTokenEnum.TELEGRAM_SERVICES_TOKEN,
    useClass: TelegramService,
  },
];
