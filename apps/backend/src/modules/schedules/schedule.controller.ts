import { Controller, Post, Get } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/modules/auth/decorators/public.decorator';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Public()
  @Post('initialize-data')
  @ApiOperation({ summary: '초기 데이터 로드' })
  async initializeData() {
    return this.scheduleService.initializeData();
  }

  @Public()
  @Get('logs')
  @ApiOperation({ summary: '스케줄 로그 조회' })
  async getLogs() {
    return this.scheduleService.getRecentLogs('INITIAL_DATA_LOAD');
  }
}
