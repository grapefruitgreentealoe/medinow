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
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { CustomLoggerService } from '../../shared/logger/logger.service';
import { WsUser } from '../../common/decorators/ws-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/roles.enum';

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

        // 해당 사용자의 모든 채팅방 구독
        const rooms = await this.chatsService.getUserRooms(user.id);
        rooms.forEach((room) => {
          client.join(room.id);
          this.logger.log(`채팅방 자동 구독: ${room.id}`);
        });

        // 사용자 상태 업데이트 (온라인)
        this.chatsService.updateUserStatus(user.id, true);

        // 관련 상대방들에게 온라인 상태 알림
        this.notifyUserStatus(user.id, true);
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`소켓 연결 중 오류: ${err.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`클라이언트 연결 해제: ${client.id}`);

    const user = client.data.user;
    if (user) {
      // 사용자 상태 업데이트 (오프라인)
      this.chatsService.updateUserStatus(user.id, false);

      // 사용자 소켓 매핑 제거
      this.chatsService.removeUserSocket(user.id, client.id);

      // 관련 상대방들에게 오프라인 상태 알림
      await this.notifyUserStatus(user.id, false);
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

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; careUnitId: string },
    @WsUser() user: User,
  ) {
    this.logger.log(`사용자 ${user.id}가 채팅방 ${data.roomId} 참여 요청!`);

    try {
      let roomId = data.roomId;

      // 방 ID가 없고 의료기관 ID가 있으면 새 방 생성 시도
      if (!roomId && data.careUnitId) {
        const newRoom = await this.chatsService.createRoom(
          user.id,
          data.careUnitId,
        );
        roomId = newRoom.id;
        this.logger.log(`새 채팅방 생성: ${roomId}`);
      } else if (!roomId) {
        return {
          success: false,
          message: '채팅방 ID 또는 의료기관 ID가 필요합니다.',
        };
      }
      // 해당 사용자가 채팅방에 접근 권한이 있는지 확인
      const hasAccess = await this.chatsService.checkRoomAccess(
        user.id,
        roomId,
      );

      if (!hasAccess) {
        this.logger.warn(`채팅방 접근 권한 없음: ${user.id}, ${roomId}`);
        return { success: false, message: '채팅방 접근 권한이 없습니다.' };
      }

      // 채팅방 참여
      client.join(roomId);

      // 읽지 않은 메시지 읽음 처리
      if (user.role !== UserRole.ADMIN) {
        await this.chatsService.markMessagesAsRead(roomId, user.id);
      }

      // 채팅 내역 가져오기
      const messages = await this.chatsService.getRoomMessages(roomId, user.id);

      return {
        success: true,
        messages,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`채팅방 참여 중 오류: ${err.message}`);
      return { success: false, message: '채팅방 참여 중 오류가 발생했습니다.' };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    const user = client.data.user;
    this.logger.log(`사용자 ${user.id}가 메시지 전송: ${data.roomId}`);

    try {
      // 메시지 저장
      const message = await this.chatsService.createMessage({
        content: data.content,
        senderId: user.id,
        roomId: data.roomId,
      });

      // 메시지 브로드캐스트
      this.server.to(data.roomId).emit('newMessage', {
        id: message.id,
        content: message.content,
        senderId: message.sender.id,
        senderName: user.name,
        isAdmin: user.role === UserRole.ADMIN,
        timestamp: message.createdAt,
        isRead: message.isRead,
      });

      // 상대방에게 알림 전송 (방에 접속해있지 않을 경우)
      const room = await this.chatsService.getRoomById(data.roomId);
      const recipientId =
        user.role === UserRole.ADMIN ? room.careUnit.id : room.user.id;

      // 상대방이 현재 방에 접속해있는지 확인
      const isRecipientInRoom = await this.chatsService.isUserInRoom(
        recipientId,
        data.roomId,
      );

      if (!isRecipientInRoom) {
        // 푸시 알림 또는 인앱 알림 처리 (별도 구현 필요)
        // 알림 서비스 구현 예시
        // 만약 NotificationService가 있다면:
        // this.notificationService.sendPushNotification({
        //   userId: recipientId,
        //   title: '새 메시지 알림',
        //   body: `${user.name}님이 새 메시지를 보냈습니다: ${data.content.substring(0, 30)}...`,
        //   data: { roomId: data.roomId, messageId: message.id }
        // });

        // 위와 같은 알림 서비스를 구현하거나, 아직 구현이 안 되었다면 TODO 주석으로 명확히 표시
        // TODO: 알림 서비스 구현 후 여기에 푸시 알림 전송 코드 추가
        this.logger.log(`상대방 ${recipientId}에게 알림 전송 필요`);
      }

      return { success: true, messageId: message.id };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`메시지 전송 중 오류: ${err.message}`);
      return { success: false, message: '메시지 전송 중 오류가 발생했습니다.' };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const user = client.data.user;

    try {
      await this.chatsService.markMessagesAsRead(data.roomId, user.id);

      // 상대방에게 읽음 상태 업데이트 알림
      this.server.to(data.roomId).emit('messagesRead', {
        roomId: data.roomId,
        userId: user.id,
        timestamp: new Date(),
      });

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

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    const user = client.data.user;

    // 채팅방의 다른 사용자에게 타이핑 상태 전달
    client.to(data.roomId).emit('userTyping', {
      roomId: data.roomId,
      userId: user.id,
      userName: user.name,
      isTyping: data.isTyping,
    });

    return { success: true };
  }
}
