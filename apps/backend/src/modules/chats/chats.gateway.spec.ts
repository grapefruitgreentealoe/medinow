import { Test, TestingModule } from '@nestjs/testing';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CustomLoggerService } from '../../shared/logger/logger.service';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { RedisService } from '../redis/redis.service';

describe('ChatsGateway', () => {
  let gateway: ChatsGateway;
  let service: ChatsService;

  // 모킹 리포지토리 생성
  const mockRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockReturnValue({}),
    update: jest.fn(),
    count: jest.fn(),
  };

  // Redis 모킹
  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
    publish: jest.fn(),
    scan: jest.fn().mockResolvedValue(['0', []]),
  };

  // 모킹 WS 서버
  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsGateway,
        ChatsService,
        { provide: getRepositoryToken(ChatRoom), useValue: mockRepository },
        { provide: getRepositoryToken(ChatMessage), useValue: mockRepository },
        { provide: JwtService, useValue: { verify: jest.fn() } },
        { provide: UsersService, useValue: { findUserById: jest.fn() } },
        {
          provide: CustomLoggerService,
          useValue: {
            setContext: jest.fn().mockReturnThis(),
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
        {
          provide: RedisService,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
            expire: jest.fn(),
            scan: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    gateway = module.get<ChatsGateway>(ChatsGateway);
    service = module.get<ChatsService>(ChatsService);

    // WebSocket Server 모킹
    gateway.server = mockServer as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
