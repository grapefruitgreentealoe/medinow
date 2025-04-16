import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { CareUnit } from 'src/modules/care-units/entities/care-unit.entity';
import { User } from './user.entity';

@Entity()
export class UserProfile extends BaseEntity {
  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text' })
  nickname: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'integer', nullable: true })
  age: number | null;

  @Column({ type: 'text', nullable: true, default: null })
  imgUrl: string | null;

  @OneToOne(() => CareUnit, (careUnit) => careUnit.user, {
    nullable: true,
    cascade: true,
  })
  @JoinColumn()
  careUnit: CareUnit | null;

  @OneToOne(() => User, (user) => user.userProfile, {
    cascade: true,
  })
  @JoinColumn()
  user: User;
}
