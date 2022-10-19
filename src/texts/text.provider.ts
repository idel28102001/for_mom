import { Provider } from '@nestjs/common';
import { TextsTokenEnum } from './enums/texts.token.enum';
import { TextsService } from './services/texts.service';

export const TextProvider: Provider[] = [
  {
    provide: TextsTokenEnum.TEXTS_SERVICES_TOKEN,
    useClass: TextsService,
  },
];
