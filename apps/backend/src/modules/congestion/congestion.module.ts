import { TypeOrmModule } from '@nestjs/typeorm';
import { CareUnit } from '../care-units/entities/care-unit.entity';
import { forwardRef, Module } from '@nestjs/common';

import { CongestionOneService } from './services/congestion-one.service';
import { CongestionTotalService } from './services/congestion-total.service';
import { RedisModule } from '../redis/redis.module';
import { CareUnitModule } from '../care-units/care-unit.module';
import { AppConfigModule } from 'src/config/app/config.module';
@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forFeature([CareUnit]),
    RedisModule,
    forwardRef(() => CareUnitModule),
  ],
  providers: [CongestionOneService, CongestionTotalService],
  exports: [CongestionOneService, CongestionTotalService],
})
export class CongestionModule {}
