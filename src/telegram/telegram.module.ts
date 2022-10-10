import { Module } from '@nestjs/common';
import { TelegramService } from './services/telegram/telegram.service';

@Module({
  providers: [TelegramService]
})
export class TelegramModule {}
