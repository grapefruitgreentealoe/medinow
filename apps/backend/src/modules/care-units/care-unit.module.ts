import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareUnitController } from './care-unit.controller';
import { CareUnitService } from './care-unit.service';
import { CareUnit } from './entities/care-unit.entity';
import { CareUnitEmergencyService } from './care-unit-emergency.service';
@Module({
  imports: [TypeOrmModule.forFeature([CareUnit])],
  controllers: [CareUnitController],
  providers: [CareUnitService, CareUnitEmergencyService],
  exports: [CareUnitService, CareUnitEmergencyService],
})
export class CareUnitModule {}
