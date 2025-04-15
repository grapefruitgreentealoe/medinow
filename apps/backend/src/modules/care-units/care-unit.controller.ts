import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { CareUnitService } from './services/care-unit.service';
import { CreateCareUnitDto } from './dto/create-care-unit.dto';
import { UpdateCareUnitDto } from './dto/update-care-unit.dto';
import { ResponseCareUnitDto } from './dto/response-care-unit.dto';
import {
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CareUnitAdminService } from './services/care-unit-admin.service';

@ApiTags('Care Unit')
@Controller('care-units')
export class CareUnitController {
  constructor(
    private readonly careUnitService: CareUnitService,
    private readonly careUnitAdminService: CareUnitAdminService,
  ) {}

  @Get()
  @ApiOperation({ summary: '응급실, 병의원, 약국 Full Data 조회' })
  @ApiQuery({ name: 'pageNo', required: false, type: Number })
  @ApiQuery({ name: 'numOfRows', required: false, type: Number })
  async getAllCareUnit(
    @Query('pageNo') pageNo: number = 1,
    @Query('numOfRows') numOfRows: number = 10,
  ): Promise<ResponseCareUnitDto[]> {
    return this.careUnitService.getAllCareUnit(pageNo, numOfRows);
  }

  @Post('full')
  @ApiOperation({ summary: 'Admin: 병원, 약국, 응급실 데이터 저장' })
  async saveAllCareUnit() {
    return this.careUnitAdminService.saveAllCareUnits();
  }

  @Get('hpid')
  @ApiOperation({ summary: 'Care Unit 상세 정보 조회' })
  async getCareUnitDetailByHpid(@Query('hpid') hpid: string) {
    return this.careUnitService.getCareUnitDetailByHpid(hpid);
  }

  @Get('location')
  @ApiOperation({ summary: 'Care Unit 위치 조회' })
  async getCareUnitDetailByLocation(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ) {
    return this.careUnitService.getCareUnitDetailByLocation(lat, lng);
  }

  @Get('category')
  @ApiOperation({ summary: 'Care Unit 카테고리별 조회' })
  @ApiQuery({
    name: 'category',
    required: true,
    type: String,
    enum: ['emergency', 'hospital', 'pharmacy'],
  })
  async getCareUnitByCategory(@Query('category') category: string) {
    return this.careUnitService.getCareUnitByCategory(category);
  }
  @Get('location-by-category')
  @ApiOperation({ summary: 'Care Unit 위치 조회' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  async getCareUnitByCategoryAndLocation(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('category') category?: string,
  ) {
    return this.careUnitService.getCareUnitByCategoryAndLocation(
      lat,
      lng,
      category,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Care Unit 상세 정보 조회' })
  async getCareUnitDetail(@Param('id') id: string) {
    return this.careUnitService.getCareUnitDetail(id);
  }

  @Post('badge')
  @ApiOperation({ summary: 'Care Unit 배지 추가' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
  })
  async addBadge(@Body('id') id: string) {
    return this.careUnitService.addBadge(id);
  }

  @Post('check-now-open')
  @ApiOperation({ summary: 'Care Unit 실시간 운영 여부 확인' })
  async checkNowOpen(@Param('id') id: string) {
    return this.careUnitService.checkNowOpen(id);
  }
}
