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
import { ChatRoom } from './entities/chat-room.entity';
import { WsJwtGuard } from './guards/ws-jwt.guard';

@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://localhost:3001',
      'http://localhost:3001',
      'https://kdt-node-2-team02.elicecoding.com',
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
    this.logger.log(`클라이언트 연결: ${client.id}`);

    try {
      // 연결 시 토큰 확인
      const user = await this.chatsService.getUserFromSocket(client);
      if (user) {
        client.data.user = user;
        this.logger.log(`사용자 인증 성공: ${user.id}`);

        // 사용자 소켓 매핑 저장
        this.chatsService.setUserSocket(user.id, client.id);

        // 사용자 상태 업데이트 (온라인)
        await this.chatsService.setUserOnline(user.id, true);
        this.logger.log(`사용자 ${user.id} 온라인 상태로 설정 완료`);

        // 해당 사용자의 모든 채팅방 구독
        const rooms = await this.chatsService.getUserRooms(user.id);
        if (rooms.length > 0) {
          rooms.forEach((room) => {
            client.join(room.id);
            this.logger.log(`채팅방 자동 구독: ${room.id}`);
          });

          // 관련 상대방들에게 온라인 상태 알림
          await this.notifyUserStatus(user.id, true);
        } else {
          this.logger.log(`사용자 ${user.id}의 채팅방이 없습니다.`);
        }
      } else {
        this.logger.warn(`인증되지 않은 소켓 연결: ${client.id}`);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`소켓 연결 중 오류: ${err.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`클라이언트 연결 해제: ${client.id}`);

    try {
      const user = client.data.user;
      if (user) {
        // 사용자 소켓 매핑 제거
        this.chatsService.removeUserSocket(user.id, client.id);

        // 다른 소켓으로 접속 중인지 확인
        const isStillOnline = this.chatsService.isUserOnline(user.id);

        if (!isStillOnline) {
          // 모든 소켓 연결이 끊어진 경우에만 오프라인 상태로 변경
          await this.chatsService.setUserOnline(user.id, false);
          this.logger.log(`사용자 ${user.id} 오프라인 상태로 설정 완료`);

          // 관련 상대방들에게 오프라인 상태 알림
          await this.notifyUserStatus(user.id, false);
        } else {
          this.logger.log(
            `사용자 ${user.id}는 다른 소켓으로 여전히 접속 중입니다`,
          );
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
      console.log('joinRoom 호출');
      const user = await this.chatsService.getUserFromSocket(client);
      if (!user) {
        client.emit('error', { message: '인증된 사용자를 찾을 수 없습니다' });
        return;
      }

      // 관리자인 경우: roomId로 직접 접근
      if (user.role === UserRole.ADMIN) {
        if (!data.roomId) {
          throw new BadRequestException('관리자는 roomId로 접근해야 합니다');
        }
        const room = await this.chatsService.getRoomById(data.roomId);
        if (!room) {
          throw new NotFoundException('채팅방을 찾을 수 없습니다');
        }
        return;
      }

      // 사용자인 경우: careUnitId로 접근
      const careUnitId = data.careUnitId;
      const roomId = data.roomId;

      // roomId가 있으면 해당 채팅방으로 접근
      if (roomId) {
        const room = await this.chatsService.getRoomById(roomId);
        if (!room) {
          throw new NotFoundException('채팅방을 찾을 수 없습니다');
        }
        return;
      }

      // roomId가 없고 careUnitId도 없으면 에러
      if (!careUnitId) {
        throw new BadRequestException('careUnitId 또는 roomId는 필수입니다');
      }

      // careUnitId로 채팅방 조회
      const existingRoom = await this.chatsService.getRoomByCareUnitId(
        careUnitId,
        user.id,
      );

      if (existingRoom) {
        // 이미 채팅방이 있으면 roomId를 클라이언트에 전송
        this.logger.log(`채팅방 ${existingRoom.id} 조회 성공`);
        return;
      }

      // 채팅방이 없으면 새로 생성
      const newRoom = await this.chatsService.createRoom(user.id, careUnitId);
      client.emit('roomCreated', { roomId: newRoom.id });
      this.logger.log(`새 채팅방 ${newRoom.id} 생성 성공`);

      // 채팅방 참여 처리
      const room = newRoom;

      // 채팅방 접근 권한 확인 - 주의: 매개변수는 (roomId, userId) 순서가 아닌 (userId, roomId) 순서임
      this.logger.log(`채팅방 ${room.id} 접근 권한 확인 시작`);
      const hasAccess = await this.chatsService.checkRoomAccess(
        user.id,
        room.id,
      );
      if (!hasAccess) {
        throw new UnauthorizedException('채팅방에 접근할 권한이 없습니다');
      }

      // 채팅방 참여
      client.join(room.id);
      this.logger.log(`사용자 ${user.id}가 채팅방 ${room.id}에 참여 완료`);

      // 채팅방 내 사용자가 아닌 경우에만 읽음 처리 수행
      if (
        room.user &&
        room.user.id !== user.id &&
        room.user.role === UserRole.ADMIN
      ) {
        await this.chatsService.markMessagesAsRead(room.id, user.id);
        this.logger.log(`채팅방 ${room.id}의 메시지 읽음 처리 완료`);
      }

      // 채팅 내역 가져오기
      const messages = await this.chatsService.getRoomMessages(
        room.id,
        user.id,
      );
      client.emit('roomMessages', {
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
      this.logger.log(
        `채팅방 ${room.id}의 메시지 전송 완료 (${messages.length}개)`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`채팅방 참여 중 오류: ${err.message}`);
      client.emit('error', { message: err.message });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    const user = client.data.user;
    this.logger.log(`사용자 ${user.id}가 메시지 전송: ${data.roomId}`);

    try {
      // Redis를 활용한 메시지 저장 (서비스 로직 활용)
      const message = await this.chatsService.createMessageWithRedis({
        content: data.content,
        senderId: user.id,
        roomId: data.roomId,
      });

      // 메시지 브로드캐스트
      this.server.to(data.roomId).emit('newMessage', {
        id: message.id,
        content: message.content,
        senderId: message.sender.id,
        senderName: user.userProfile?.nickname || 'Unknown',
        isAdmin: user.role === UserRole.ADMIN,
        timestamp: message.createdAt,
        isRead: message.isRead,
      });

      // 알림 처리 로직을 서비스에 위임
      const notification = await this.chatsService.handleMessageNotification(
        user.id,
        data.roomId,
        data.content,
      );

      // 온라인이지만 채팅방에 없는 경우 인앱 알림
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

        this.logger.log(
          `온라인 상대방 ${notification.recipientId}에게 인앱 알림 전송 완료`,
        );
      } else if (!notification.isOnline) {
        // 오프라인인 경우 향후 푸시 알림 서비스를 위한 로직
        this.logger.log(
          `오프라인 상대방 ${notification.recipientId}에게 푸시 알림 예약 필요`,
        );
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
      // 메시지 읽음 처리 (서비스 로직 활용)
      await this.chatsService.markMessagesAsReadWithRedis(data.roomId, user.id);

      // 채팅방 정보 조회 - 상대방 ID 확인을 위해
      const room = await this.chatsService.getRoomById(data.roomId);
      const recipientId =
        room.user.id === user.id ? room.careUnit.id : room.user.id;

      // 읽음 상태 정보
      const readStatus = {
        roomId: data.roomId,
        userId: user.id,
        timestamp: new Date(),
      };

      // 상대방에게 읽음 상태 업데이트 알림
      this.server.to(data.roomId).emit('messagesRead', readStatus);

      // 상대방이 온라인 상태인지 확인
      const isRecipientOnline =
        await this.chatsService.isUserOnlineRedis(recipientId);

      // 상대방이 온라인 상태면 실시간 카운터 업데이트
      if (isRecipientOnline) {
        this.server.to(recipientId).emit('unreadCountUpdated', {
          roomId: data.roomId,
          count: 0, // 전부 읽음 처리되었으므로 0
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

  // 읽지 않은 메시지 카운트 조회
  @SubscribeMessage('getUnreadCount')
  async handleGetUnreadCount(@ConnectedSocket() client: Socket) {
    const user = client.data.user;

    try {
      // 읽지 않은 메시지 수 조회 (서비스 로직 활용)
      const unreadCounts = await this.chatsService.getUnreadMessageCount(
        user.id,
      );

      // 클라이언트에 전송
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

  // 채팅방 나가기
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = client.data.user;

    try {
      // 채팅방 나가기 처리 (서비스 로직 활용)
      const notification = await this.chatsService.leaveRoomWithNotification(
        user.id,
        data.roomId,
      );

      // 소켓 룸에서 나가기
      client.leave(data.roomId);

      // 상대방에게 알림
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
      // 타이핑 상태 알림 데이터 준비 (서비스 로직 활용)
      const typingNotification =
        await this.chatsService.prepareTypingNotification(
          user.id,
          data.roomId,
          data.isTyping,
        );

      // 채팅방의 다른 사용자에게 타이핑 상태 전달
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
