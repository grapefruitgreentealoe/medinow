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
import { CareUnitService } from './care-unit.service';
import { CreateCareUnitDto } from './dto/create-care-unit.dto';
import { UpdateCareUnitDto } from './dto/update-care-unit.dto';
import { ResponseCareUnitDto } from './dto/response-care-unit.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CareUnitEmergencyService } from './care-unit-emergency.service';

@ApiTags('Care Unit')
@Controller('careUnit')
export class CareUnitController {
  constructor(
    private readonly careUnitService: CareUnitService,
    private readonly careUnitEmergencyService: CareUnitEmergencyService,
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

  @Post('emergency')
  @ApiOperation({ summary: '응급실 데이터 저장' })
  async saveEmergencyCareUnit() {
    return this.careUnitEmergencyService.saveEmergencyCareUnit();
  }

  // @Get('location')
  // @ApiOperation({ summary: '위치 조회' })
  // @ApiQuery({ name: 'pageNo', required: false, type: Number })
  // @ApiQuery({ name: 'numOfRows', required: false, type: Number })
  // async getCareUnitLocation(
  //   @Query('pageNo') pageNo: number = 1,
  //   @Query('numOfRows') numOfRows: number = 10,
  // ): Promise<ResponseCareUnitDto[]> {
  //   return await this.careUnitService.getCareUnitLocation(pageNo, numOfRows);
  // }
}
