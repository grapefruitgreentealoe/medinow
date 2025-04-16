import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CareUnitService } from './services/care-unit.service';
import { ResponseCareUnitDto } from './dto/response-care-unit.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CareUnitAdminService } from './services/care-unit-admin.service';
import { CareUnit } from './entities/care-unit.entity';
@ApiTags('Care Unit')
@Controller('care-units')
export class CareUnitController {
  constructor(
    private readonly careUnitService: CareUnitService,
    private readonly careUnitAdminService: CareUnitAdminService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Admin : Api로 응급실, 병의원, 약국 Full Data 조회',
  })
  @ApiQuery({
    name: 'pageNo',
    required: false,
    type: Number,
    description: '페이지 번호',
    example: 1,
  })
  @ApiQuery({
    name: 'numOfRows',
    required: false,
    type: Number,
    description: '페이지 당 데이터 개수',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: ResponseCareUnitDto,
  })
  async getAllCareUnit(
    @Query('pageNo') pageNo: number = 1,
    @Query('numOfRows') numOfRows: number = 10,
  ): Promise<ResponseCareUnitDto[]> {
    return this.careUnitService.getAllCareUnit(pageNo, numOfRows);
  }

  @Post('full')
  @ApiOperation({ summary: 'Admin: 초기세팅 / 병원, 약국, 응급실 데이터 저장' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: String,
  })
  async saveAllCareUnit() {
    return this.careUnitAdminService.saveAllCareUnits();
  }

  @Post('hospital-departments')
  @ApiOperation({ summary: 'Admin: 병원 진료과목 저장' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: String,
  })
  async saveHospitalDepartments() {
    return this.careUnitAdminService.saveHospitalDepartments();
  }

  @Get('category')
  @ApiOperation({ summary: 'Admin : 카테고리별 조회 (전체 DB대상)' })
  @ApiQuery({
    name: 'category',
    required: true,
    type: String,
    enum: ['emergency', 'hospital', 'pharmacy'],
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: [CareUnit],
  })
  async getCareUnitByCategory(@Query('category') category: string) {
    return this.careUnitService.getCareUnitByCategory(category);
  }

  @Post('badge')
  @ApiOperation({ summary: 'Admin : 배지 추가' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: CareUnit,
  })
  async addBadge(@Body('id') id: string) {
    return this.careUnitService.addBadge(id);
  }

  @Get('hpId')
  @ApiOperation({
    summary: '사용자, 기관관리자 : hpId와 category로 상세 정보 조회',
  })
  @ApiQuery({
    name: 'hpId',
    required: true,
    type: String,
    description: '기관 고유 아이디',
    example: 'A2108916',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    enum: ['emergency', 'hospital', 'pharmacy'],
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: CareUnit,
  })
  async getCareUnitDetailByhpId(
    @Query('hpId') hpId: string,
    @Query('category') category?: string,
  ) {
    return this.careUnitService.getCareUnitDetailByhpId(hpId, category);
  }

  @Get('location')
  @ApiOperation({ summary: '사용자 : 위치로 특정 기관 조회' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: [CareUnit],
    schema: {
      example: [
        {
          id: 'uuid-example',
          name: '서울대학교병원',
          address: '서울특별시 종로구 대학로 101',
          tel: '02-2072-2114',
          category: 'hospital',
          hpId: 'A1100027',
          mondayOpen: 900,
          mondayClose: 1700,
          tuesdayOpen: 900,
          tuesdayClose: 1700,
          wednesdayOpen: 900,
          wednesdayClose: 1700,
          thursdayOpen: 900,
          thursdayClose: 1700,
          fridayOpen: 900,
          fridayClose: 1700,
          saturdayOpen: 900,
          saturdayClose: 1300,
          sundayOpen: null,
          sundayClose: null,
          holidayOpen: null,
          holidayClose: null,
          lat: 37.5417253860377,
          lng: 127.043351028535,
          is_badged: false,
          now_open: true,
          kakao_url: 'https://place.map.kakao.com/...',
        },
      ],
    },
  })
  async getCareUnitDetailByLocation(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ) {
    return await this.careUnitService.getCareUnitDetailByLocation(lat, lng);
  }

  // 위치로 조회하나, name, category, hpId 반환하기
  @Get('location-signup')
  @ApiOperation({ summary: '사용자 : 위치로 기관 조회 (가입 페이지)' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiResponse({
    status: 200,
    description: '성공',
    schema: {
      example: [
        {
          name: '서울대학교병원',
          category: 'hospital',
          hpId: 'A1100027',
        },
      ],
    },
  })
  async getCareUnitByLocationForSignup(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ) {
    const careUnits = await this.careUnitService.getCareUnitDetailByLocation(
      lat,
      lng,
    );
    return careUnits.map((careUnit) => ({
      name: careUnit.name,
      category: careUnit.category,
      hpId: careUnit.hpId,
    }));
  }

  @Get('location-by-category')
  @ApiOperation({ summary: '사용자 : 위치와 카테고리로 반경 조회' })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    enum: ['emergency', 'hospital', 'pharmacy'],
  })
  @ApiQuery({
    name: 'level',
    required: true,
    type: Number,
    description: '반경 레벨 (예시: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'lat',
    required: true,
    type: Number,
    description: '동 위도 (예시: 37.5417253860377)',
  })
  @ApiQuery({
    name: 'lng',
    required: true,
    type: Number,
    description: '동 경도 (예시: 127.043351028535)',
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: [CareUnit],
    schema: {
      example: [
        {
          id: 'uuid-example',
          name: '서울대학교병원',
          address: '서울특별시 종로구 대학로 101',
          tel: '02-2072-2114',
          category: 'hospital',
          hpId: 'A1100027',
          mondayOpen: 900,
          mondayClose: 1700,
          tuesdayOpen: 900,
          tuesdayClose: 1700,
          wednesdayOpen: 900,
          wednesdayClose: 1700,
          thursdayOpen: 900,
          thursdayClose: 1700,
          fridayOpen: 900,
          fridayClose: 1700,
          saturdayOpen: 900,
          saturdayClose: 1300,
          sundayOpen: null,
          sundayClose: null,
          holidayOpen: null,
          holidayClose: null,
          lat: 37.5417253860377,
          lng: 127.043351028535,
          is_badged: false,
          now_open: true,
          kakao_url: 'https://place.map.kakao.com/...',
        },
      ],
    },
  })
  async getCareUnitByCategoryAndLocation(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('level') level: number = 1,
    @Query('category') category?: string,
  ) {
    return this.careUnitService.getCareUnitByCategoryAndLocation(
      lat,
      lng,
      level,
      category,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '사용자, 기관관리자 : Care Unit 상세 정보 조회' })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '기관 고유 아이디',
    example: 'A2108916',
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: CareUnit,
  })
  async getCareUnitDetail(@Param('id') id: string): Promise<CareUnit | null> {
    return this.careUnitService.getCareUnitDetail(id);
  }

  @Post('check-now-open')
  @ApiOperation({ summary: '기관관리자 : 실시간 운영 여부 확인' })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '기관 고유 아이디',
    example: 'c81845c9-4008-4fd8-8f47-903dc73d9f61',
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: String,
  })
  async checkNowOpen(@Param('id') id: string): Promise<{ message: string }> {
    return this.careUnitService.checkNowOpen(id);
  }
}
