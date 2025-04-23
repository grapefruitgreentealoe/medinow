import { BaseEntity } from '../../../common/entities/base.entity';
import { Column, Entity, OneToOne, OneToMany } from 'typeorm';
import { UserRole } from '../../../common/enums/roles.enum';
import { Exclude } from 'class-transformer';
import { UserProfile } from './user-profile.entity';
import { Image } from 'src/modules/images/entities/image.entity';
import { Favorite } from 'src/modules/favorites/entities/favorite.entity';
import { ChatMessage } from 'src/modules/chats/entities/chat-message.entity';
import { ChatRoom } from 'src/modules/chats/entities/chat-room.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';

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

  @OneToMany(() => Review, (review) => review.user, {
    cascade: true,
  })
  reviews: Review[];

  @OneToMany(() => ChatMessage, (message) => message.sender, {
    cascade: true,
  })
  chatMessages: ChatMessage[];

  @OneToMany(() => ChatRoom, (room) => room.user, {
    cascade: true,
  })
  chatRooms: ChatRoom[];
}
