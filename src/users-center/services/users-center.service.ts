import { Inject, Injectable } from '@nestjs/common';
import { UsersCenterTokenEnum } from '../enums/tokens/users-center.token.enum';
import { Repository } from 'typeorm';
import { UsersCenterEntity } from '../entities/users.entity';
import { User } from '@grammyjs/types';
import { RolesEnum } from '../enums/roles.enum';

@Injectable()
export class UsersCenterService {
  constructor(
    @Inject(UsersCenterTokenEnum.USERS_CENTER_REPOSITORY_TOKEN)
    private readonly usersCenterRepo: Repository<UsersCenterEntity>,
  ) {}

  get repo() {
    return this.usersCenterRepo;
  }

  async editPhoneNumber({
    telegramId,
    phoneNumber,
  }: {
    telegramId: string;
    phoneNumber: string;
  }) {
    return await this.usersCenterRepo.update({ telegramId }, { phoneNumber });
  }

  async makeAdmin(telegramId: string) {
    return await this.usersCenterRepo.update(
      { telegramId },
      { role: RolesEnum.ADMIN },
    );
  }

  async saveToDBUser(obj: User) {
    return await this.usersCenterRepo
      .createQueryBuilder('U')
      .insert()
      .into(UsersCenterEntity)
      .values({
        telegramId: obj.id.toString(),
        firstname: obj.first_name,
        lastname: obj.last_name,
        username: obj.username,
      })
      .orIgnore()
      .execute();
  }

  async savePhoneNumber(obj: User, phone: string) {
    return await this.usersCenterRepo.update(
      { telegramId: obj.id.toString() },
      { phoneNumber: phone },
    );
  }
}
