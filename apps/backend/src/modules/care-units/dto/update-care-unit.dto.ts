import { PartialType } from '@nestjs/swagger';
import { CreateCareUnitDto } from './create-care-unit.dto';

export class UpdateCareUnitDto extends PartialType(CreateCareUnitDto) {}
