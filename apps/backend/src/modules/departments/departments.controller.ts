import { Controller, Get, Param } from '@nestjs/common';
import { DepartmentsService } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get('/:careUnitId')
  async getHospitalDepartments(@Param('careUnitId') careUnitId: string) {
    return this.departmentsService.getHospitalDepartments(careUnitId);
  }
}
