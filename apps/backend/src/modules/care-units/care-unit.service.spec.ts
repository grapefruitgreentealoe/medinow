import { Test, TestingModule } from '@nestjs/testing';
import { CareUnitService } from './care-unit.service';

describe('CareUnitService', () => {
  let service: CareUnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CareUnitService],
    }).compile();

    service = module.get<CareUnitService>(CareUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
