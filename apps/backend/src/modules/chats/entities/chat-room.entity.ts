import {
  Entity,
  Column,
  OneToMany,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ChatMessage } from './chat-message.entity';
import { CareUnit } from '../../care-units/entities/care-unit.entity';
import { User } from '../../users/entities/user.entity';

@Index(['user', 'careUnit'], { unique: true })
@Entity('chat_rooms')
export class ChatRoom extends BaseEntity {
  @ManyToOne(() => User, (user) => user.chatRooms)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => CareUnit, (careUnit) => careUnit.chatRooms)
  @JoinColumn({ name: 'care_unit_id' })
  careUnit: CareUnit;

  @OneToMany(() => ChatMessage, (message) => message.room)
  messages: ChatMessage[];

  @Column({ nullable: true })
  lastMessageAt: Date;

  @Column({ default: 0 })
  unreadCount: number;

  @Column({ nullable: true })
  lastReadAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
