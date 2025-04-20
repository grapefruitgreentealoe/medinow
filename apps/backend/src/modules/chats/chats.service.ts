import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CustomLoggerService } from '../../shared/logger/logger.service';

@Injectable()
export class ChatsService {
  // 온라인 사용자 소켓 매핑
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    private jwtService: JwtService,
    private usersService: UsersService,
    private logger: CustomLoggerService,
  ) {
    this.logger.setContext('ChatsService');
  }

  // 소켓에서 사용자 정보 추출
  async getUserFromSocket(socket: Socket) {
    const token = this.extractTokenFromSocket(socket);
    if (!token) {
      return null;
    }

    try {
      const payload = this.jwtService.verify(token);
      return await this.usersService.findUserById(payload.sub);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`토큰 검증 실패: ${err.message}`);
      return null;
    }
  }

  private extractTokenFromSocket(socket: Socket): string | undefined {
    const cookies = socket.handshake.headers.cookie;
    if (!cookies) return undefined;

    const cookieMap = {};
    cookies.split(';').forEach((cookie) => {
      const [key, value] = cookie.trim().split('=');
      cookieMap[key] = value;
    });

    return cookieMap['accessToken'];
  }

  // 사용자 소켓 관리
  setUserSocket(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.add(socketId);
    }
  }

  removeUserSocket(userId: string, socketId: string) {
    if (this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }
  }

  isUserOnline(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets ? sockets.size > 0 : false;
  }

  // 사용자가 특정 채팅방에 접속 중인지 확인
  async isUserInRoom(userId: string, roomId: string): Promise<boolean> {
    // 사용자가 온라인이 아니면 방에 접속 중이 아님
    if (!this.isUserOnline(userId)) {
      return false;
    }

    // 채팅방 존재 여부 및 접근 권한 확인
    const hasAccess = await this.checkRoomAccess(userId, roomId);
    if (!hasAccess) {
      return false;
    }

    // 온라인 상태여도 방에 접속했는지는 클라이언트 상태를 추적해야 함
    // 여기서는 단순화를 위해 온라인이면 방에 접속 중이라고 가정
    return true;
  }

  // 채팅방 생성
  async createRoom(userId: string, careUnitId: string): Promise<ChatRoom> {
    // 이미 존재하는 채팅방 확인
    const existingRoom = await this.chatRoomRepository.findOne({
      where: { careUnit: { id: careUnitId }, user: { id: userId } },
    });

    if (existingRoom) {
      existingRoom.isActive = true;
      return this.chatRoomRepository.save(existingRoom);
    }

    // 새 채팅방 생성
    const room = this.chatRoomRepository.create({
      userId,
      careUnitId,
      isActive: true,
    });

    return await this.chatRoomRepository.save(room);
  }

  // 채팅방 상세 조회
  async getRoomById(roomId: string): Promise<ChatRoom> {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
    });

    if (!room) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다');
    }

    return room;
  }

  // 사용자의 모든 채팅방 조회
  async getUserRooms(userId: string): Promise<ChatRoom[]> {
    // 사용자가 속한 모든 채팅방 조회 (일반 사용자 또는 의료기관 관리자)
    return this.chatRoomRepository.find({
      where: [
        { userId }, // 일반 사용자로서 참여중인 방
        { careUnitId: userId }, // 의료기관 관리자로서 참여중인 방
      ],
      order: { updatedAt: 'DESC' },
    });
  }

  // 채팅방 접근 권한 확인
  async checkRoomAccess(userId: string, roomId: string): Promise<boolean> {
    const room = await this.getRoomById(roomId);
    return room.userId === userId || room.careUnitId === userId;
  }

  // 메시지 생성
  async createMessage(data: {
    content: string;
    senderId: string;
    roomId: string;
  }): Promise<ChatMessage> {
    // 채팅방 존재 확인
    const room = await this.getRoomById(data.roomId);

    // 권한 확인
    if (room.userId !== data.senderId && room.careUnitId !== data.senderId) {
      throw new UnauthorizedException(
        '해당 채팅방에 메시지를 보낼 권한이 없습니다',
      );
    }

    // 메시지 생성
    const message = this.chatMessageRepository.create({
      content: data.content,
      senderId: data.senderId,
      roomId: data.roomId,
      isRead: false,
    });

    // 채팅방 최종 업데이트 시간 갱신
    room.updatedAt = new Date();
    await this.chatRoomRepository.save(room);

    return this.chatMessageRepository.save(message);
  }

  // 채팅방 메시지 목록 조회
  async getRoomMessages(
    roomId: string,
    userId: string,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    const room = await this.getRoomById(roomId);
    const senderToMark = room.userId === userId ? room.careUnitId : room.userId;

    return this.chatMessageRepository.find({
      where: { roomId, senderId: senderToMark },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // 메시지 읽음 처리
  async markMessagesAsRead(roomId: string, userId: string): Promise<void> {
    // 권한 확인
    const hasAccess = await this.checkRoomAccess(userId, roomId);
    if (!hasAccess) {
      throw new UnauthorizedException('해당 채팅방에 접근할 권한이 없습니다');
    }

    const room = await this.getRoomById(roomId);

    const senderToMark = room.userId === userId ? room.careUnitId : room.userId;

    // 상대방이 보낸 메시지만 읽음 처리
    await this.chatMessageRepository.update(
      {
        roomId,
        senderId: senderToMark,
        isRead: false,
      },
      { isRead: true },
    );
  }

  // 사용자 온라인 상태 업데이트
  updateUserStatus(userId: string, isOnline: boolean): void {
    // 실제 데이터베이스에 온라인 상태 저장이 필요하면 여기에 구현

    this.logger.log(
      `사용자 ${userId} 상태 변경: ${isOnline ? '온라인' : '오프라인'}`,
    );
  }

  // 읽지 않은 메시지 수 조회
  async getUnreadMessageCount(
    userId: string,
  ): Promise<{ roomId: string; count: number }[]> {
    const rooms = await this.getUserRooms(userId);

    const result = await Promise.all(
      rooms.map(async (room) => {
        const count = await this.chatMessageRepository.count({
          where: {
            roomId: room.id,
            senderId: userId,
            isRead: false,
          },
        });

        return { roomId: room.id, count };
      }),
    );

    return result.filter((item) => item.count > 0);
  }
}
