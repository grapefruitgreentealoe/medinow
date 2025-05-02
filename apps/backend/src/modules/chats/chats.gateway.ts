import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import {
  UseGuards,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomLoggerService } from '../../shared/logger/logger.service';
import { UserRole } from '../../common/enums/roles.enum';
import { JoinRoomDto } from './dto/join-room.dto';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://localhost:3001',
      'http://localhost:3001',
      'https://medinow.co.kr',
      'https://www.medinow.co.kr',
    ],
  },
  namespace: 'chat',
})
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatsService: ChatsService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('ChatsGateway');
  }

  async handleConnection(client: Socket) {
    try {
      const user = await this.chatsService.getUserFromSocket(client);

      if (user) {
        client.data.user = user;
        this.chatsService.setUserSocket(user.id, client.id);
        await this.chatsService.setUserOnline(user.id, true);

        const rooms = await this.chatsService.getUserRooms(user.id);
        if (rooms.length > 0) {
          rooms.forEach((room) => {
            client.join(room.id);
          });
          await this.notifyUserStatus(user.id, true);
        }
      } else {
        this.logger.warn(`인증되지 않은 소켓 연결: ${client.id}`);
        client.disconnect();
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`소켓 연결 중 오류: ${err.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const user = client.data.user;
      if (user) {
        this.chatsService.removeUserSocket(user.id, client.id);
        const isStillOnline = this.chatsService.isUserOnline(user.id);

        if (!isStillOnline) {
          await this.chatsService.setUserOnline(user.id, false);
          await this.notifyUserStatus(user.id, false);
        }
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`소켓 연결 해제 중 오류: ${err.message}`);
    }
  }

  private async notifyUserStatus(userId: string, isOnline: boolean) {
    const rooms = await this.chatsService.getUserRooms(userId);
    rooms.forEach((room) => {
      this.server.to(room.id).emit('userStatus', {
        userId,
        isOnline,
        timestamp: new Date(),
      });
    });
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ): Promise<void> {
    try {
      const user = client.data.user;
      if (!user) {
        throw new UnauthorizedException('사용자 정보가 없습니다');
      }

      const { careUnitId, roomId } = data;

      if (user.role === UserRole.USER) {
        if (!roomId) {
          if (!careUnitId) {
            throw new BadRequestException('의료기관 ID는 필수입니다');
          }

          const existingRoom = await this.chatsService.getRoomByCareUnitId(
            careUnitId,
            user.id,
          );

          if (existingRoom) {
            client.emit('roomCreated', { roomId: existingRoom.id });
            return;
          }

          const newRoom = await this.chatsService.createRoom(
            user.id,
            careUnitId,
          );
          client.emit('roomCreated', { roomId: newRoom.id });
          return;
        }

        const room = await this.chatsService.getRoomById(roomId);
        if (!room) {
          throw new NotFoundException('채팅방을 찾을 수 없습니다');
        }

        const hasAccess = await this.chatsService.checkRoomAccess(
          user.id,
          room.id,
        );
        if (!hasAccess) {
          throw new UnauthorizedException('채팅방에 접근할 권한이 없습니다');
        }

        client.join(room.id);

        if (room.user && room.user.id !== user.id) {
          await this.chatsService.markMessagesAsRead(room.id, user.id);
        }

        const messages = await this.chatsService.getRoomMessages(
          room.id,
          user.id,
        );
        client.emit('roomMessages', {
          roomId: room.id,
          messages: messages.map((message) => ({
            id: message.id,
            content: message.content,
            senderId: message.sender.id,
            senderName: message.sender.userProfile?.nickname || 'Unknown',
            isAdmin: message.sender.role === UserRole.ADMIN,
            timestamp: message.createdAt,
            isRead: message.isRead,
          })),
        });
      } else if (user.role === UserRole.ADMIN) {
        if (!roomId) {
          throw new BadRequestException('채팅방 ID는 필수입니다');
        }

        const room = await this.chatsService.getRoomById(roomId);
        if (!room) {
          throw new NotFoundException('채팅방을 찾을 수 없습니다');
        }

        client.join(room.id);

        const messages = await this.chatsService.getRoomMessages(
          room.id,
          user.id,
        );
        client.emit('roomMessages', {
          roomId: room.id,
          messages: messages.map((message) => ({
            id: message.id,
            content: message.content,
            senderId: message.sender.id,
            senderName: message.sender.userProfile?.nickname || 'Unknown',
            isAdmin: message.sender.role === UserRole.ADMIN,
            timestamp: message.createdAt,
            isRead: message.isRead,
          })),
        });
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`채팅방 참여 중 오류: ${err.message}`);
      client.emit('error', {
        status: 'error',
        message: err.message,
      });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    const user = client.data.user;

    try {
      const message = await this.chatsService.createMessageWithRedis({
        content: data.content,
        senderId: user.id,
        roomId: data.roomId,
      });

      this.server.to(data.roomId).emit('newMessage', {
        roomId: data.roomId,
        id: message.id,
        content: message.content,
        senderId: message.sender.id,
        senderName: user.userProfile?.nickname || 'Unknown',
        isAdmin: user.role === UserRole.ADMIN,
        timestamp: message.createdAt,
        isRead: message.isRead,
      });

      const notification = await this.chatsService.handleMessageNotification(
        user.id,
        data.roomId,
        data.content,
      );

      if (notification.isOnline && !notification.isInRoom) {
        this.server.to(notification.recipientId).emit('chatNotification', {
          type: 'newMessage',
          roomId: data.roomId,
          sender: {
            id: user.id,
            name: user.userProfile?.name || 'Unknown',
          },
          preview: notification.messagePreview,
          timestamp: new Date(),
        });
      }

      return { success: true, messageId: message.id };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`메시지 전송 중 오류: ${err.message}`);
      return { success: false, message: '메시지 전송 중 오류가 발생했습니다.' };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = client.data.user;

    try {
      await this.chatsService.markMessagesAsReadWithRedis(data.roomId, user.id);

      const room = await this.chatsService.getRoomById(data.roomId);
      const recipientId =
        room.user.id === user.id ? room.careUnit.id : room.user.id;

      const readStatus = {
        roomId: data.roomId,
        userId: user.id,
        timestamp: new Date(),
      };

      this.server.to(data.roomId).emit('messagesRead', {
        roomId: data.roomId,
        readStatus,
      });

      const isRecipientOnline =
        await this.chatsService.isUserOnlineRedis(recipientId);

      if (isRecipientOnline) {
        this.server.to(recipientId).emit('unreadCountUpdated', {
          roomId: data.roomId,
          count: 0,
        });
      }

      return { success: true };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`메시지 읽음 처리 중 오류: ${err.message}`);
      return {
        success: false,
        message: '메시지 읽음 처리 중 오류가 발생했습니다.',
      };
    }
  }

  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    const user = client.data.user;

    try {
      const unreadCounts = await this.chatsService.getUnreadMessageCount(
        user.id,
      );

      client.emit('unreadCounts', unreadCounts);

      return { success: true, data: unreadCounts };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`읽지 않은 메시지 조회 중 오류: ${err.message}`);
      return {
        success: false,
        message: '읽지 않은 메시지 조회 중 오류가 발생했습니다.',
      };
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = client.data.user;

    try {
      const notification = await this.chatsService.leaveRoomWithNotification(
        user.id,
        data.roomId,
      );

      client.leave(data.roomId);

      this.server.to(data.roomId).emit('userLeftRoom', {
        roomId: notification.roomId,
        userId: user.id,
        timestamp: notification.timestamp,
      });

      return { success: true, message: '채팅방에서 나갔습니다.' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`채팅방 나가기 중 오류: ${err.message}`);
      return {
        success: false,
        message: '채팅방 나가기 중 오류가 발생했습니다.',
      };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const user = client.data.user;

    try {
      const typingNotification =
        await this.chatsService.prepareTypingNotification(
          user.id,
          data.roomId,
          data.isTyping,
        );

      client.to(data.roomId).emit('userTyping', typingNotification);

      return { success: true };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`타이핑 상태 전송 중 오류: ${err.message}`);
      return {
        success: false,
        message: '타이핑 상태 전송 중 오류가 발생했습니다.',
      };
    }
  }
}
