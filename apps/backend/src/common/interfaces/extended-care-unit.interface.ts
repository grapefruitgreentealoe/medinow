import { CareUnit } from '../../modules/care-units/entities/care-unit.entity';

export interface ExtendedCareUnit
  extends Omit<CareUnit, 'departments' | 'favorites' | 'reviews'> {
  isFavorite: boolean;
  isChatAvailable: boolean;
  reviewCount: number;
  departments: { id: string; name: string }[] | null;
  averageRating: number;
}
