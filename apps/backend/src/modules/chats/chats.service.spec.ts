import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CustomLoggerService } from '../../shared/logger/logger.service';
import { REDIS_CLIENT } from '../redis/redis.constants';
import { RedisService } from '../redis/redis.service';

describe('ChatsService', () => {
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    service = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
