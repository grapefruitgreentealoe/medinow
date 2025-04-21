import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CareUnitService } from './services/care-unit.service';
import { ResponseCareUnitDto } from './dto/response-care-unit.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { CareUnitAdminService } from './services/care-unit-admin.service';
import { CareUnit } from './entities/care-unit.entity';
import { CongestionOneService } from '../congestion/services/congestion-one.service';
import { ResponseCongestionDto } from './dto/response-congestion.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RequestUser } from 'src/common/decorators/request-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DepartmentsService } from '../departments/departments.service';
@ApiTags('의료기관')
@Controller('care-units')
export class CareUnitController {
  constructor(
    private readonly careUnitService: CareUnitService,
    private readonly careUnitAdminService: CareUnitAdminService,
    private readonly congestionService: CongestionOneService,
    private readonly departmentsService: DepartmentsService,
  ) {}

  @Get()
  @Public()
  @ApiExcludeEndpoint()
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
    return await this.careUnitAdminService.getAllCareUnit(pageNo, numOfRows);
  }

  @Post('full')
  @Public()
  // @ApiExcludeEndpoint()
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
  @Public()
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Admin: 병원 진료과목 저장' })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: String,
  })
  async saveHospitalDepartments() {
    return await this.departmentsService.saveHospitalDepartments();
  }

  @Get('category')
  @Public()
  @ApiExcludeEndpoint()
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
    example: [
      {
        id: 'uuid-example',
        name: '서울대학교병원',
        address: '서울특별시 종로구 대학로 101',
      },
    ],
  })
  async getCareUnitByCategory(@Query('category') category: string) {
    return this.careUnitAdminService.getCareUnitByCategory(category);
  }

  @Post('badge')
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
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
  @Public()
  @ApiExcludeEndpoint()
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
    return await this.careUnitService.getCareUnitDetailByHpid(hpId, category);
  }

  @Get('location')
  @Public()
  @ApiExcludeEndpoint()
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
          isBadged: false,
          nowOpen: true,
          kakaoUrl: 'https://place.map.kakao.com/...',
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
  @Public()
  @ApiExcludeEndpoint()
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
  @Public()
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
          isBadged: false,
          nowOpen: true,
          kakaoUrl: 'https://place.map.kakao.com/...',
        },
      ],
    },
  })
  async getCareUnitByCategoryAndLocation(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('level') level: number = 1,
    @Query('category') category?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const paginationDto = { page, limit };
    return this.careUnitService.getCareUnitByCategoryAndLocation(
      paginationDto,
      lat,
      lng,
      level,
      category,
    );
  }

  //로그인 후 지도 조회
  @UseGuards(JwtAuthGuard)
  @Get('location-by-category-login')
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
    example: 35.19994528957531,
  })
  @ApiQuery({
    name: 'lng',
    required: true,
    type: Number,
    description: '동 경도 (예시: 127.043351028535)',
    example: 128.56710886511746,
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
          isBadged: false,
          nowOpen: true,
          kakaoUrl: 'https://place.map.kakao.com/...',
        },
      ],
    },
  })
  async getCareUnitByCategoryAndLocationLogin(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('level') level: number = 1,
    @Query('category') category?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @RequestUser() user?: User,
  ) {
    const paginationDto = { page, limit };
    return this.careUnitService.getCareUnitByCategoryAndLocation(
      paginationDto,
      lat,
      lng,
      level,
      category,
      user,
    );
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '사용자, 기관관리자 : Care Unit 상세 정보 조회' })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '기관 고유 아이디',
    example: '46dcef6e-b986-4688-adea-04dd39fe8323',
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
  @Public()
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
  async checkNowOpen(@Param('id') id: string): Promise<boolean> {
    return this.careUnitService.checkNowOpen(id);
  }

  @Get('congestion/:id')
  @Public()
  @ApiOperation({ summary: '사용자 :  특정 기관 혼잡도 조회' })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: '기관 고유 아이디',
    example: 'a5388b7a-cd05-40a6-b9b2-af406c65ddb7',
  })
  @ApiResponse({
    status: 200,
    description: '성공',
    type: ResponseCongestionDto,
  })
  async getCongestion(@Param('id') id: string) {
    return this.congestionService.getCongestion(id);
  }
}
