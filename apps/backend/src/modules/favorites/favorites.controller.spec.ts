import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';

describe('FavoritesController', () => {
  let controller: FavoritesController;

  const mockFavoritesService = {
    toggleFavorite: jest.fn(),
    getFavorites: jest.fn(),
    getCareUnitFavorites: jest.fn(),
    checkIsFavorite: jest.fn(),
  };

  const mockFavoriteRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        {
          provide: FavoritesService,
          useValue: mockFavoritesService,
        },
        {
          provide: getRepositoryToken(Favorite),
          useValue: mockFavoriteRepository,
        },
      ],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
