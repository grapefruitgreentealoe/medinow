import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity, OneToOne, OneToMany } from 'typeorm';
import { UserRole } from '../../../common/enums/roles.enum';
import { Exclude } from 'class-transformer';
import { UserProfile } from './user-profile.entity';
import { Image } from 'src/modules/images/entities/image.entity';
import { Favorite } from 'src/modules/favorites/entities/favorite.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'text', unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'text', nullable: true })
  password: string | null;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Exclude()
  @Column({ type: 'text', nullable: true, default: null })
  refreshToken: string | null;

  @OneToOne(() => UserProfile, (userProfile) => userProfile.user)
  userProfile: UserProfile;

  @OneToMany(() => Image, (image) => image.user, {
    cascade: true,
  })
  images: Image[];

  @OneToMany(() => Favorite, (favorite) => favorite.user, {
    cascade: true,
  })
  favorites: Favorite[];
}
