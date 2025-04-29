import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CustomLoggerService } from '../../shared/logger/logger.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRole } from '../../common/enums/roles.enum';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ChatsService {
  // 온라인 사용자 소켓 매핑
  private readonly userSockets = new Map<string, Set<string>>();
  // 채팅방 비활성화 시간 (하루 = 60 * 60 * 24 초)
  private readonly CHAT_INACTIVITY_TIMEOUT = 60 * 60 * 24;
  // Redis 채널 접두사
  private readonly REDIS_ROOM_CHANNEL = 'chat:room:';
  // Redis 사용자 상태 키 접두사
  private readonly REDIS_USER_ONLINE = 'user:online:';
  // Redis 채팅방 활성 상태 키 접두사
  private readonly REDIS_ROOM_ACTIVE = 'room:active:';

  constructor(
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatMessage)
    private chatMessageRepository: Repository<ChatMessage>,
    private jwtService: JwtService,
    private usersService: UsersService,
    private logger: CustomLoggerService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly redisService: RedisService,
  ) {
    this.logger.setContext('ChatsService');
    this.setupRedisSubscriber();
  }

  // Redis 구독 설정
  private setupRedisSubscriber() {
    // Redis 구독 클라이언트 생성 (별도의 연결 사용)
    const subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    // 메시지 수신 시 처리
    subscriber.on('message', (channel, message) => {
      if (channel.startsWith(this.REDIS_ROOM_CHANNEL)) {
        const roomId = channel.replace(this.REDIS_ROOM_CHANNEL, '');
        this.handleRedisMessage(roomId, JSON.parse(message));
      }
    });

    // 패턴 구독 설정 (모든 채팅방 메시지)
    subscriber.psubscribe(`${this.REDIS_ROOM_CHANNEL}*`);

    this.logger.log('Redis 구독 설정 완료');
  }

  // Redis 메시지 처리
  private handleRedisMessage(roomId: string, data: any) {
    // 여기서 Socket.io를 통해 연결된 클라이언트에게 메시지 전송
    // 실제 구현은 Socket.io 게이트웨이에서 처리되어야 함
    this.logger.debug(
      `Redis로 메시지 수신: 방 ${roomId}, 메시지: ${JSON.stringify(data)}`,
    );
  }

  // 채팅방에 메시지 발행 (Redis Pub/Sub 사용)
  async publishMessage(roomId: string, message: any) {
    const channel = `${this.REDIS_ROOM_CHANNEL}${roomId}`;
    await this.redis.publish(channel, JSON.stringify(message));

    // 채팅방 활성 시간 업데이트
    await this.updateRoomActivity(roomId);
  }

  // 채팅방 활성 상태 업데이트
  async updateRoomActivity(roomId: string) {
    const key = `${this.REDIS_ROOM_ACTIVE}${roomId}`;
    // 현재 시간을 Unix 타임스탬프로 문자열로 저장
    await this.redisService.set(
      key,
      Date.now().toString(),
      this.CHAT_INACTIVITY_TIMEOUT,
    );
  }

  // 사용자 온라인 상태 설정
  async setUserOnline(userId: string, isOnline: boolean) {
    const key = `${this.REDIS_USER_ONLINE}${userId}`;

    try {
      if (isOnline) {
        // 온라인 상태는 30분 자동 만료 (활동이 없으면 오프라인으로 간주)
        await this.redisService.set(key, '1', this.CHAT_INACTIVITY_TIMEOUT);
        this.logger.log(`Redis 온라인 상태 저장 성공: ${userId}`);
      } else {
        // 오프라인 상태로 설정 (키 삭제)
        await this.redisService.del(key);
        this.logger.log(`Redis 온라인 상태 삭제 성공: ${userId}`);
      }

      // 기존 메서드 호출
      this.updateUserStatus(userId, isOnline);

      // 온라인 상태 확인
      const isOnlineCheck = await this.isUserOnlineRedis(userId);
      this.logger.log(
        `사용자 ${userId}의 Redis 온라인 상태 확인: ${isOnlineCheck}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`온라인 상태 설정 중 오류: ${err.message}`);
    }
  }

  // 사용자 온라인 상태 확인
  async isUserOnlineRedis(userId: string): Promise<boolean> {
    try {
      const key = `${this.REDIS_USER_ONLINE}${userId}`;
      const result = await this.redisService.get(key);
      const isOnline = result !== null;
      this.logger.log(
        `Redis 온라인 상태 확인: ${userId} - ${isOnline ? '온라인' : '오프라인'}`,
      );
      return isOnline;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Redis에서 온라인 상태 확인 중 오류: ${err.message}`);
      return false;
    }
  }

  // 사용자 온라인 상태 업데이트
  updateUserStatus(userId: string, isOnline: boolean): void {
    // 실제 데이터베이스에 온라인 상태 저장이 필요하면 여기에 구현
    try {
      // 메모리 상태 업데이트
      if (isOnline) {
        if (!this.userSockets.has(userId)) {
          this.userSockets.set(userId, new Set());
        }
      }

      this.logger.log(
        `사용자 ${userId} 상태 변경: ${isOnline ? '온라인' : '오프라인'}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`사용자 상태 업데이트 중 오류: ${err.message}`);
    }
  }

  // 채팅방 메시지 생성 (Redis 활용)
  async createMessageWithRedis(data: {
    content: string;
    senderId: string;
    roomId: string;
  }): Promise<ChatMessage> {
    // DB에 메시지 저장
    const message = await this.createMessage(data);

    // Redis를 통해 메시지 발행
    await this.publishMessage(data.roomId, {
      id: message.id,
      content: message.content,
      senderId: data.senderId,
      roomId: data.roomId,
      createdAt: message.createdAt,
      isRead: message.isRead,
    });

    // 채팅방 활성 상태 갱신
    await this.updateRoomActivity(data.roomId);

    return message;
  }

  // 읽음 표시 처리 (Redis 활용)
  async markMessagesAsReadWithRedis(
    roomId: string,
    userId: string,
  ): Promise<void> {
    // 기존 메시지 읽음 처리
    await this.markMessagesAsRead(roomId, userId);

    // 채팅방 정보 조회
    const room = await this.getRoomById(roomId);

    // 상대방 ID 확인
    const recipientId =
      room.user.id === userId ? room.careUnit.id : room.user.id;

    // Redis에 읽음 상태 저장 (최근 읽은 시간)
    const redisKey = `chat:read:${roomId}:${userId}`;
    await this.redisService.set(redisKey, new Date().toISOString());

    // 읽음 상태 정보 반환
    return;
  }

  // 메시지 전송 후 알림 처리 로직
  async handleMessageNotification(
    senderId: string,
    roomId: string,
    content: string,
  ): Promise<{
    recipientId: string;
    isOnline: boolean;
    isInRoom: boolean;
    messagePreview: string;
  }> {
    // 채팅방 정보 조회
    const room = await this.getRoomById(roomId);

    let recipientId: string;

    // 발신자가 일반 사용자인 경우: 의료기관의 관리자 찾기
    if (room.user && room.user.id === senderId) {
      // 의료기관의 관리자 사용자 조회
      const adminUser = await this.usersService.getUserByCareUnitId(
        room.careUnit.id,
      );

      if (!adminUser) {
        this.logger.warn(
          `의료기관 ${room.careUnit.id}의 관리자를 찾을 수 없습니다`,
        );
        recipientId = room.careUnit.id; // 관리자를 찾지 못하면 기본적으로 의료기관 ID 사용
      } else {
        this.logger.log(
          `의료기관 ${room.careUnit.id}의 관리자 ID: ${adminUser.id}로 메시지 알림`,
        );
        recipientId = adminUser.id;
      }
    } else {
      // 발신자가 관리자인 경우: 일반 사용자 ID 사용
      recipientId = room.user.id;
    }

    // 상대방 온라인 상태 확인
    const isOnline = await this.isUserOnlineRedis(recipientId);
    this.logger.log(
      `수신자 ${recipientId}의 온라인 상태: ${isOnline ? '온라인' : '오프라인'}`,
    );

    // 상대방이 채팅방에 있는지 확인
    const isInRoom = await this.isUserInRoom(recipientId, roomId);

    // 메시지 미리보기 생성
    const messagePreview =
      content.length > 30 ? `${content.substring(0, 30)}...` : content;

    return {
      recipientId,
      isOnline,
      isInRoom,
      messagePreview,
    };
  }

  // 채팅방 나가기 + 알림 데이터 준비
  async leaveRoomWithNotification(
    userId: string,
    roomId: string,
  ): Promise<{
    success: boolean;
    roomId: string;
    timestamp: Date;
  }> {
    // 채팅방 나가기 처리
    await this.leaveRoom(userId, roomId);

    // 알림 데이터 준비
    return {
      success: true,
      roomId,
      timestamp: new Date(),
    };
  }

  // 타이핑 상태 알림 데이터 준비
  async prepareTypingNotification(
    userId: string,
    roomId: string,
    isTyping: boolean,
  ): Promise<{
    roomId: string;
    userId: string;
    userName: string;
    isTyping: boolean;
  }> {
    // 사용자 정보 조회
    const user = await this.usersService.findUserById(userId);
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return {
      roomId,
      userId,
      userName: user.userProfile?.name || 'Unknown',
      isTyping,
    };
  }

  // Redis를 이용한 비활성 채팅방 확인
  async checkInactiveRoomsWithRedis() {
    try {
      // 활성 상태 키 패턴으로 모든 키 조회
      const activeKeys = await this.redisService.scan(
        `${this.REDIS_ROOM_ACTIVE}*`,
      );
      const activeKeySet = new Set(activeKeys);

      // 모든 활성 채팅방 조회
      const rooms = await this.chatRoomRepository.find({
        where: { isActive: true },
        select: ['id'],
      });

      // Redis에 키가 없는 활성 채팅방 찾기
      const inactiveRoomIds: string[] = [];
      for (const room of rooms) {
        const key = `${this.REDIS_ROOM_ACTIVE}${room.id}`;
        if (!activeKeySet.has(key)) {
          inactiveRoomIds.push(room.id);
        }
      }

      // 비활성 채팅방 처리
      if (inactiveRoomIds.length > 0) {
        for (const roomId of inactiveRoomIds) {
          const room = await this.chatRoomRepository.findOne({
            where: { id: roomId },
          });

          if (room) {
            room.isActive = false;
            await this.chatRoomRepository.save(room);
          }
        }

        this.logger.log(
          `Redis 확인: ${inactiveRoomIds.length}개의 비활성 채팅방 종료됨`,
        );
      }
    } catch (error) {
      const err = error as Error;
      this.logger.error(`비활성 채팅방 확인 중 오류: ${err.message}`);
    }
  }

  // Redis 활용 비활성 채팅방 정리 작업 (30분마다 실행)
  @Cron(CronExpression.EVERY_30_MINUTES)
  async deactivateInactiveRoomsWithRedis() {
    await this.checkInactiveRoomsWithRedis();
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
      this.logger.error(`토큰 검증 실패: ${err.message}!`);
      return null;
    }
  }

  private extractTokenFromSocket(socket: Socket): string | undefined {
    // 쿼리 파라미터에서 토큰 확인
    const queryToken = socket.handshake.query.token;
    if (queryToken) {
      this.logger.log('쿼리 파라미터에서 토큰을 찾았습니다.');
      return Array.isArray(queryToken) ? queryToken[0] : queryToken;
    }

    // 쿠키에서 토큰 확인
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
  async createRoom(userId: string, careUnitId: string) {
    this.logger.log(
      `채팅방 생성 시도: 사용자 ${userId}, 의료기관 ${careUnitId}`,
    );

    try {
      // 병원 관리자 사용자 조회
      const adminUser = await this.usersService.getUserByCareUnitId(careUnitId);

      if (!adminUser) {
        this.logger.error(
          `의료기관 ${careUnitId}의 관리자를 찾을 수 없습니다.`,
        );
        throw new NotFoundException('해당 병원의 관리자를 찾을 수 없습니다.');
      }

      this.logger.log(`관리자 찾음: ${adminUser.id}, 의료기관: ${careUnitId}`);

      return await this.chatRoomRepository.manager.transaction(
        async (manager) => {
          // 이미 존재하는 채팅방 확인
          const existingRoom = await manager.findOne(ChatRoom, {
            where: {
              careUnit: { id: careUnitId },
              user: { id: userId },
              isActive: true,
            },
            relations: ['user', 'careUnit'],
            lock: { mode: 'pessimistic_write' },
          });

          if (existingRoom) {
            this.logger.log(`기존 채팅방 찾음: ${existingRoom.id}`);
            return existingRoom;
          }
          // 새 채팅방 생성
          const room = this.chatRoomRepository.create({
            user: { id: userId },
            careUnit: { id: careUnitId },
            isActive: true,
          });

          this.logger.log(
            `새 채팅방 생성: ${room.id}, 관리자: ${adminUser.id}, 사용자: ${userId}, 의료기관: ${careUnitId}`,
          );

          return await manager.save(room);
        },
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`채팅방 생성 중 오류 발생: ${err.message}`);
      throw err;
    }
  }

  // 채팅방 상세 조회
  async getRoomById(roomId: string) {
    const room = await this.chatRoomRepository.findOne({
      where: { id: roomId },
      relations: ['user', 'careUnit', 'messages', 'user.userProfile'],
    });

    if (!room) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다');
    }

    return {
      id: room.id,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      deletedAt: room.deletedAt || null,
      lastMessageAt: room.lastMessageAt,
      unreadCount: room.unreadCount,
      lastReadAt: room.lastReadAt,
      isActive: room.isActive,
      messages: room.messages,
      user: {
        id: room.user.id,
        nickName: room.user.userProfile.nickname,
      },
      careUnit: {
        id: room.careUnit.id,
        name: room.careUnit.name,
      },
    };
  }

  // 채팅방 상세 조회
  async getRoomByCareUnitId(careUnitId: string, userId: string) {
    const room = await this.chatRoomRepository.findOne({
      where: { careUnit: { id: careUnitId }, user: { id: userId } },
      relations: ['user', 'careUnit', 'messages', 'user.userProfile'],
    });

    if (!room) {
      throw new NotFoundException('채팅방을 찾을 수 없습니다');
    }

    return {
      id: room.id,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      deletedAt: room.deletedAt || null,
      lastMessageAt: room.lastMessageAt,
      unreadCount: room.unreadCount,
      lastReadAt: room.lastReadAt,
      isActive: room.isActive,
      messages: room.messages,
      user: {
        id: room.user.id,
        nickName: room.user.userProfile.nickname,
      },
      careUnit: {
        id: room.careUnit.id,
        name: room.careUnit.name,
      },
    };
  }

  // 사용자의 모든 채팅방 조회
  async getUserRooms(userId: string) {
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }

    if (user.role === UserRole.ADMIN) {
      // 관리자인 경우: 해당 관리자가 관리하는 병원에 연결된 채팅방 조회
      const careUnitId = await this.getCareUnitIdForAdmin(userId);

      if (!careUnitId) {
        this.logger.warn(`관리자 ${userId}에게 연결된 의료기관이 없습니다`);
        return [];
      }

      const rooms = await this.chatRoomRepository.find({
        where: {
          careUnit: { id: careUnitId },
          isActive: true,
        },
        relations: ['user', 'user.userProfile', 'careUnit'],
        order: { updatedAt: 'DESC' },
      });

      return rooms.map((room) => ({
        id: room.id,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        lastMessageAt: room.lastMessageAt,
        unreadCount: room.unreadCount,
        lastReadAt: room.lastReadAt,
        isActive: room.isActive,
        user: {
          id: room.user.id,
          nickName: room.user.userProfile.nickname,
        },
        careUnit: {
          id: room.careUnit.id,
          name: room.careUnit.name,
          address: room.careUnit.address,
          tel: room.careUnit.tel,
          category: room.careUnit.category,
          hpId: room.careUnit.hpId,
          mondayOpen: room.careUnit.mondayOpen,
          mondayClose: room.careUnit.mondayClose,
          tuesdayOpen: room.careUnit.tuesdayOpen,
          tuesdayClose: room.careUnit.tuesdayClose,
          wednesdayOpen: room.careUnit.wednesdayOpen,
          wednesdayClose: room.careUnit.wednesdayClose,
          thursdayOpen: room.careUnit.thursdayOpen,
          thursdayClose: room.careUnit.thursdayClose,
          fridayOpen: room.careUnit.fridayOpen,
          fridayClose: room.careUnit.fridayClose,
          saturdayOpen: room.careUnit.saturdayOpen,
          saturdayClose: room.careUnit.saturdayClose,
          sundayOpen: room.careUnit.sundayOpen,
          sundayClose: room.careUnit.sundayClose,
          holidayOpen: room.careUnit.holidayOpen,
          holidayClose: room.careUnit.holidayClose,
          lat: room.careUnit.lat,
          lng: room.careUnit.lng,
          isBadged: room.careUnit.isBadged,
          nowOpen: room.careUnit.nowOpen,
          kakaoUrl: room.careUnit.kakaoUrl,
        },
      }));
    } else {
      // 일반 사용자인 경우: 해당 사용자가 속한 채팅방 조회
      const rooms = await this.chatRoomRepository.find({
        where: {
          user: { id: userId },
          isActive: true,
        },
        relations: ['user', 'user.userProfile', 'careUnit'],
        order: { updatedAt: 'DESC' },
      });

      return rooms.map((room) => ({
        id: room.id,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt,
        lastMessageAt: room.lastMessageAt,
        unreadCount: room.unreadCount,
        lastReadAt: room.lastReadAt,
        isActive: room.isActive,
        user: {
          id: room.user.id,
          nickName: room.user.userProfile.nickname,
        },
        careUnit: {
          id: room.careUnit.id,
          name: room.careUnit.name,
        },
      }));
    }
  }

  // 관리자 사용자의 CareUnit ID 조회
  private async getCareUnitIdForAdmin(
    adminUserId: string,
  ): Promise<string | null> {
    try {
      const user =
        await this.usersService.findUserByIdWithRelations(adminUserId);
      if (!user) {
        this.logger.error(
          `관리자 ${adminUserId}의 사용자 정보를 찾을 수 없습니다`,
        );
        return null;
      }

      const userProfile = user.userProfile;

      // userProfile.careUnitId가 있으면 그 값을 반환
      if (!userProfile.careUnit) {
        this.logger.error(`관리자 ${adminUserId}의 의료기관 ID가 없습니다`);
        return null;
      }

      return userProfile.careUnit.id;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`관리자의 의료기관 조회 실패: ${err.message}`);
      return null;
    }
  }

  // 채팅방 접근 권한 확인
  async checkRoomAccess(userId: string, roomId: string): Promise<boolean> {
    try {
      const room = await this.getRoomById(roomId);

      // 1. 일반 사용자 권한 확인: 채팅방의 사용자인 경우
      if (room.user.id === userId) {
        this.logger.log(
          `사용자 ${userId}는 채팅방 ${roomId}의 일반 사용자로 접근 권한 있음`,
        );
        return true;
      }

      // 2. 의료기관 ID가 직접 일치하는 경우
      if (room.careUnit.id === userId) {
        this.logger.log(
          `사용자 ${userId}는 의료기관 ID와 일치하여 채팅방 ${roomId}에 접근 권한 있음`,
        );
        return true;
      }

      // 3. 관리자 권한 확인
      const user = await this.usersService.findUserById(userId);
      if (user && user.role === UserRole.ADMIN) {
        this.logger.log(`관리자 ${userId}는 채팅방 ${roomId}에 접근 권한 있음`);
        return true;
      }

      this.logger.warn(`사용자 ${userId}는 채팅방 ${roomId}에 접근 권한 없음`);
      return false;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`채팅방 접근 권한 확인 중 오류: ${err.message}`);
      return false;
    }
  }

  // 메시지 생성
  async createMessage(data: {
    content: string;
    senderId: string;
    roomId: string;
  }): Promise<ChatMessage> {
    // 채팅방 존재 확인
    const room = await this.getRoomById(data.roomId);

    // 권한 확인 - checkRoomAccess 함수 재사용
    const hasAccess = await this.checkRoomAccess(data.senderId, data.roomId);
    if (!hasAccess) {
      this.logger.error(
        `사용자 ${data.senderId}는 채팅방 ${data.roomId}에 메시지를 보낼 권한이 없습니다`,
      );
      throw new UnauthorizedException(
        '해당 채팅방에 메시지를 보낼 권한이 없습니다',
      );
    }

    // 메시지 생성
    const message = this.chatMessageRepository.create({
      content: data.content,
      sender: { id: data.senderId },
      room: { id: data.roomId },
      isRead: false,
    });

    // 채팅방 최종 업데이트 시간 갱신
    room.updatedAt = new Date();
    room.lastMessageAt = new Date();

    const recipientId =
      room.user.id === data.senderId
        ? (await this.usersService.getUserByCareUnitId(room.careUnit.id))?.id
        : room.user.id;

    if (!recipientId) {
      this.logger.error(
        `상대방 ID를 찾을 수 없습니다: 사용자 ${data.senderId}, 채팅방 ${data.roomId}`,
      );
      throw new NotFoundException('상대방 ID를 찾을 수 없습니다');
    }

    const isRecipientInRoom = await this.isUserInRoom(recipientId, data.roomId);

    if (!isRecipientInRoom) {
      room.unreadCount = (room.unreadCount || 0) + 1;
    }

    const savedMessage = await this.chatMessageRepository.save(message);

    // Redis를 통해 메시지 발행
    await this.publishMessage(data.roomId, {
      id: savedMessage.id,
      content: savedMessage.content,
      senderId: data.senderId,
      roomId: data.roomId,
      createdAt: savedMessage.createdAt,
      isRead: savedMessage.isRead,
    });

    return savedMessage;
  }

  // 채팅방 메시지 목록 조회
  async getRoomMessages(
    roomId: string,
    userId: string,
    limit: number = 50,
  ): Promise<ChatMessage[]> {
    const room = await this.getRoomById(roomId);

    return this.chatMessageRepository.find({
      where: { room: { id: roomId } },
      relations: ['sender'],
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

    let senderToMark: string | undefined;
    if (room.user.id === userId) {
      const adminUser = await this.usersService.getUserByCareUnitId(
        room.careUnit.id,
      );
      senderToMark = adminUser?.id;

      if (!senderToMark) {
        this.logger.error(
          `관리자 ID를 찾을 수 없습니다: 사용자 ${userId}, 채팅방 ${roomId}`,
        );
        throw new NotFoundException('관리자 ID를 찾을 수 없습니다');
      }
    } else {
      senderToMark = room.user.id;
    }

    // 상대방이 보낸 메시지만 읽음 처리
    await this.chatMessageRepository.update(
      {
        room: { id: roomId },
        sender: { id: senderToMark },
        isRead: false,
      },
      { isRead: true },
    );

    room.lastReadAt = new Date(); // 마지막 읽은 시간 업데이트
    room.unreadCount = 0; // 읽지 않은 메시지 수 초기화

    await this.chatRoomRepository.save(room);
  }

  // 읽지 않은 메시지 수 조회
  async getUnreadMessageCount(
    userId: string,
  ): Promise<{ roomId: string; count: number }[]> {
    const rooms = await this.getUserRooms(userId);

    const result = await Promise.all(
      rooms.map(async (room) => {
        const senderToMark =
          room.user.id === userId ? room.careUnit.id : room.user.id;
        const count = await this.chatMessageRepository.count({
          where: {
            room: { id: room.id },
            sender: { id: senderToMark },
            isRead: false,
          },
        });

        return { roomId: room.id, count };
      }),
    );

    return result.filter((item) => item.count > 0);
  }

  // 채팅방 나가기
  async leaveRoom(userId: string, roomId: string): Promise<void> {
    const room = await this.getRoomById(roomId);
    const hasAccess = await this.checkRoomAccess(userId, roomId);

    if (!hasAccess) {
      throw new UnauthorizedException('해당 채팅방에 접근할 권한이 없습니다');
    }

    // 채팅방 비활성화 처리
    room.isActive = false;
    await this.chatRoomRepository.save(room);

    this.logger.log(`사용자 ${userId}가 채팅방 ${roomId}에서 나갔습니다`);
  }
}
