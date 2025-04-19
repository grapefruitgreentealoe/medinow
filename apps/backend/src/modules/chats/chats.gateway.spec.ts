import { Test, TestingModule } from '@nestjs/testing';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { CustomLoggerService } from '../../shared/logger/logger.service';

describe('ChatsGateway', () => {
  let gateway: ChatsGateway;

  // 모의 로거 생성
  const mockLoggerService = {
    setContext: jest.fn().mockReturnThis(),
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsGateway,
        ChatsService,
        {
          provide: CustomLoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    gateway = module.get<ChatsGateway>(ChatsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
