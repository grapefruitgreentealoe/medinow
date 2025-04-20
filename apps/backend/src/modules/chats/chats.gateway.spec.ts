import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chat-room.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CustomLoggerService } from '../../shared/logger/logger.service';

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
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
