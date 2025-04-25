import { CareUnit } from '@/shared/type';

export interface FavoritesResponse {
  careUnits: CareUnit[];
  page: number;
  totalPages: number;
}
