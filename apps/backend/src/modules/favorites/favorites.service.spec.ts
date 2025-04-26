import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesService } from './favorites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { CareUnitService } from '../care-units/services/care-unit.service';
import { UsersService } from '../users/users.service';
import { CustomLoggerService } from 'src/shared/logger/logger.service';

describe('FavoritesService', () => {
  let service: FavoritesService;

  // Repository 모킹
  const mockFavoriteRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  // CareUnitService 모킹
  const mockCareUnitService = {
    getCareUnitDetail: jest.fn(),
  };

  // UsersService 모킹
  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: getRepositoryToken(Favorite),
          useValue: mockFavoriteRepository,
        },
        {
          provide: CareUnitService,
          useValue: mockCareUnitService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: CustomLoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
