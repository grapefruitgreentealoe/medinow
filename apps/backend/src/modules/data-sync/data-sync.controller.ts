import { Controller, Post, Get, UseGuards, Query } from '@nestjs/common';
import { DataSyncService } from './data-sync.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdminGuard } from '../../common/guards/admin.guard';

@ApiTags('데이터 동기화')
@Controller('data-sync')
@UseGuards(JwtAuthGuard, AdminGuard)
export class DataSyncController {
  constructor(private readonly dataSyncService: DataSyncService) {}

  @Post('hospitals')
  @ApiOperation({ summary: '병원 데이터 수동 동기화' })
  @ApiResponse({ status: 200, description: '동기화 시작됨' })
  async syncHospitals() {
    return this.dataSyncService.syncHospitals();
  }

  @Post('departments')
  @ApiOperation({ summary: '부서 데이터 수동 동기화' })
  @ApiResponse({ status: 200, description: '동기화 시작됨' })
  async syncDepartments() {
    return this.dataSyncService.syncDepartments();
  }

  @Get('logs')
  @ApiOperation({ summary: '동기화 로그 조회' })
  @ApiResponse({ status: 200, description: '동기화 로그 목록' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSyncLogs(@Query('limit') limit: number = 10) {
    return this.dataSyncService.getSyncLogs(limit);
  }
}
