import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareUnitController } from './care-unit.controller';
import { CareUnitService } from './services/care-unit.service';
import { CareUnit } from './entities/care-unit.entity';
import { CareUnitAdminService } from './services/care-unit-admin.service';
@Module({
  imports: [TypeOrmModule.forFeature([CareUnit])],
  controllers: [CareUnitController],
  providers: [CareUnitService, CareUnitAdminService],
  exports: [CareUnitService, CareUnitAdminService],
})
export class CareUnitModule {}
