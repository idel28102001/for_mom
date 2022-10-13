import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsersCenterProvider } from './users-center.provider';
import { UsersCenterTokenEnum } from './enums/tokens/users-center.token.enum';

@Module({
  imports: [DatabaseModule],
  providers: UsersCenterProvider,
  exports: [UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN],
})
export class UsersCenterModule {}
