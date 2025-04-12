import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareUnitController } from './care-unit.controller';
import { CareUnitService } from './care-unit.service';
import { CareUnit } from './entities/care-unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CareUnit])],
  controllers: [CareUnitController],
  providers: [CareUnitService],
  exports: [CareUnitService],
})
export class CareUnitModule {}
