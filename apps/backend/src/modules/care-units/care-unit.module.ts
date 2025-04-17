import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareUnitController } from './care-unit.controller';
import { CareUnitService } from './services/care-unit.service';
import { CareUnit } from './entities/care-unit.entity';
import { CareUnitAdminService } from './services/care-unit-admin.service';
import { AppConfigModule } from 'src/config/app/config.module';
import { Department } from 'src/modules/departments/entities/department.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '../redis/redis.module';
import { CongestionTotalService } from '../congestion/services/congestion-total.service';
import { CongestionOneService } from '../congestion/services/congestion-one.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([CareUnit, Department]),
    AppConfigModule,
    RedisModule,
  ],
  controllers: [CareUnitController],
  providers: [
    CareUnitService,
    CareUnitAdminService,
    CongestionTotalService,
    CongestionOneService,
  ],
  exports: [CareUnitService, CareUnitAdminService, CongestionTotalService],
})
export class CareUnitModule {}
