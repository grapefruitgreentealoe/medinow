import { Test, TestingModule } from '@nestjs/testing';
import { CareUnitController } from './care-unit.controller';
import { CareUnitService } from './care-unit.service';

describe('CareUnitController', () => {
  let controller: CareUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CareUnitController],
      providers: [CareUnitService],
    }).compile();

    controller = module.get<CareUnitController>(CareUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
