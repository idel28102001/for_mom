import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './users/users.module';
import { UsersCenterModule } from './users-center/users-center.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { SignupsModule } from './signups/signups.module';

@Module({
  imports: [
    SignupsModule,
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TelegramModule,
    UsersModule,
    UsersCenterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
