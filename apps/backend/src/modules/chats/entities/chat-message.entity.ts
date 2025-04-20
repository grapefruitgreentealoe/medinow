import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { ChatRoom } from './chat-room.entity';

@Entity('chat_messages')
@Index(['roomId', 'createdAt'])
export class ChatMessage extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ name: 'sender_id' })
  senderId: string;

  @Column({ name: 'room_id' })
  roomId: string;

  @ManyToOne(() => User, (user) => user.chatMessages)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => ChatRoom, (room) => room.messages)
  @JoinColumn({ name: 'room_id' })
  room: ChatRoom;
}
