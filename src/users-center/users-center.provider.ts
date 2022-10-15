import { Provider } from '@nestjs/common';
import { UsersCenterService } from './services/users-center.service';
import { UsersCenterTokenEnum } from './enums/tokens/users-center.token.enum';
import { UsersCenterEntity } from './entities/users.entity';
import { DATABASE_SOURCE_TOKEN } from '../database/databse.constant';
import { DataSource } from 'typeorm';

export const UsersCenterProvider: Provider[] = [
  {
    provide: UsersCenterTokenEnum.USERS_CENTER_SERVICES_TOKEN,
    useClass: UsersCenterService,
  },
  {
    provide: UsersCenterTokenEnum.USERS_CENTER_REPOSITORY_TOKEN,
    inject: [DATABASE_SOURCE_TOKEN],
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(UsersCenterEntity),
  },
];
