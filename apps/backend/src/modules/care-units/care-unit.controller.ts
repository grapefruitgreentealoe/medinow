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

@ApiTags('Care Unit')
@Controller('care-unit')
export class CareUnitController {
  constructor(private readonly careUnitService: CareUnitService) {}

  @Get()
  @ApiOperation({ summary: '약국 Full Data 조회' })
  @ApiQuery({ name: 'pageNo', required: false, type: Number })
  @ApiQuery({ name: 'numOfRows', required: false, type: Number })
  async getAllPharmacy(
    @Query('pageNo') pageNo: number = 1,
    @Query('numOfRows') numOfRows: number = 50,
  ): Promise<ResponseCareUnitDto[]> {
    return this.careUnitService.getAllPharmacy(pageNo, numOfRows);
  }
}
