import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AppConfigService } from 'src/config/app/config.service';
import { JwtService } from '@nestjs/jwt';
import { CustomLoggerService } from 'src/shared/logger/logger.service';

// UsersService 모킹
const mockUsersService = {
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
};

const mockLoggerService = {
  setContext: jest.fn().mockReturnThis(),
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: UsersService,
        },
        {
          provide: AppConfigService,
          useValue: {
            jwtAccessSecret: 'test-access-secret',
            jwtRefreshSecret: 'test-refresh-secret',
            jwtAccessExpirationTime: 3600,
            jwtRefreshExpirationTime: 604800,
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
          },
        },
        {
          provide: CustomLoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
