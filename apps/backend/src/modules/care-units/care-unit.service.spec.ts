import { Test, TestingModule } from '@nestjs/testing';
import { CareUnitService } from './care-unit.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CareUnit } from './entities/care-unit.entity';

describe('CareUnitService', () => {
  let service: CareUnitService;

  const mockCareUnitRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareUnitService,
        {
          provide: getRepositoryToken(CareUnit),
          useValue: mockCareUnitRepository,
        },
      ],
    }).compile();

    service = module.get<CareUnitService>(CareUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
