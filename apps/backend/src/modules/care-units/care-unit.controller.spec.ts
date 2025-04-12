import { Test, TestingModule } from '@nestjs/testing';
import { CareUnitController } from './care-unit.controller';
import { CareUnitService } from './care-unit.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CareUnit } from './entities/care-unit.entity';

describe('CareUnitController', () => {
  let controller: CareUnitController;

  const mockCareUnitRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareUnitController],
      providers: [
        CareUnitService,
        {
          provide: getRepositoryToken(CareUnit),
          useValue: mockCareUnitRepository,
        },
      ],
    }).compile();

    controller = module.get<CareUnitController>(CareUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
