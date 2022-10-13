import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SignupsEnum } from '../enums/signups.enum';
import { UsersCenterEntity } from '../../users-center/entities/users.entity';

@Entity('signups')
export class SignupsEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column()
  type: SignupsEnum;

  @ManyToOne(() => UsersCenterEntity, (user) => user.signups)
  user: UsersCenterEntity;

  @Column({ nullable: true })
  messageId: number;
}
