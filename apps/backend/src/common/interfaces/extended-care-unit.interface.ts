import { CareUnit } from '../../modules/care-units/entities/care-unit.entity';

export interface ExtendedCareUnit
  extends Omit<CareUnit, 'departments' | 'favorites' | 'reviews'> {
  isFavorite: boolean;
  isChatAvailable: boolean;
  departments: string[];
}
