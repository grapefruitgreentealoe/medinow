import { CareUnit } from '../../modules/care-units/entities/care-unit.entity';

export interface ExtendedCareUnit extends CareUnit {
  isFavorite: boolean;
  isChatAvailable: boolean;
}
