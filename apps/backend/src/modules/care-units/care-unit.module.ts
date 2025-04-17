import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareUnitController } from './care-unit.controller';
import { CareUnitService } from './services/care-unit.service';
import { CareUnit } from './entities/care-unit.entity';
import { CareUnitAdminService } from './services/care-unit-admin.service';
import { AppConfigModule } from 'src/config/app/config.module';
import { Department } from 'src/modules/departments/entities/department.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { RedisModule } from '../redis/redis.module';
import { CongestionModule } from '../congestion/congestion.module';
import { UsersModule } from '../users/users.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([CareUnit, Department]),
    AppConfigModule,
    RedisModule,
    forwardRef(() => UsersModule ),
    forwardRef(() => CongestionModule),
  ],
  controllers: [CareUnitController],
  providers: [CareUnitService, CareUnitAdminService],
  exports: [CareUnitService, CareUnitAdminService],
})
export class CareUnitModule {}
