import { Provider } from '@nestjs/common';
import { SignupsTokenEnum } from './enums/signups.token.enum';
import { DATABASE_SOURCE_TOKEN } from '../database/databse.constant';
import { SignupsEntity } from './entities/signups.entity';
import { DataSource } from 'typeorm';
import { SignupsService } from './services/signups.service';

export const SignupsProvider: Provider[] = [
  {
    provide: SignupsTokenEnum.SIGNUPS_SERVICES_TOKEN,
    useClass: SignupsService,
  },
  {
    provide: SignupsTokenEnum.SIGNUPS_REPOSITORY_TOKEN,
    inject: [DATABASE_SOURCE_TOKEN],
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(SignupsEntity),
  },
];
