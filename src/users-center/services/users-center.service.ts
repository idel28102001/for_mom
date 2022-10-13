import { Inject, Injectable } from '@nestjs/common';
import { UsersCenterTokenEnum } from '../enums/tokens/users-center.token.enum';
import { Repository } from 'typeorm';
import { UsersCenterEntity } from '../entities/users.entity';

@Injectable()
export class UsersCenterService {
  constructor(
    @Inject(UsersCenterTokenEnum.USERS_CENTER_REPOSITORY_TOKEN)
    private readonly usersCenterRepo: Repository<UsersCenterEntity>,
  ) {}

  get repo() {
    return this.usersCenterRepo;
  }
}
