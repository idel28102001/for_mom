import { Module } from '@nestjs/common';
import { SignupsProvider } from './signups.provider';
import { SignupsTokenEnum } from './enums/signups.token.enum';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: SignupsProvider,
  exports: [SignupsTokenEnum.SIGNUPS_SERVICES_TOKEN],
})
export class SignupsModule {}
