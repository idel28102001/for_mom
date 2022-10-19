import { Module } from '@nestjs/common';
import { TextProvider } from './text.provider';
import { TextsTokenEnum } from './enums/texts.token.enum';

@Module({
  providers: TextProvider,
  exports: [TextsTokenEnum.TEXTS_SERVICES_TOKEN],
})
export class TextsModule {}
