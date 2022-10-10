import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './users/users.module';
import { UsersCenterModule } from './users-center/users-center.module';

@Module({
  imports: [TelegramModule, UsersModule, UsersCenterModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
