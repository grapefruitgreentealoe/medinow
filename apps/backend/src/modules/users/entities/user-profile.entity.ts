import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { CareUnit } from 'src/modules/care-units/entities/care-unit.entity';
import { User } from './user.entity';
import { Image } from 'src/modules/images/entities/image.entity';

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

  @OneToOne(() => Image, (image) => image.userProfile, {
    cascade: true,
    nullable: true,
  })
  image: Image | null;
}
