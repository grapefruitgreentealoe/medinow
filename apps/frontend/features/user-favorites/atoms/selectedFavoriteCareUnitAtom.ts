import { atom } from 'jotai';
import { CareUnit } from '@/shared/type';
export const selectedFavoriteCareUnitAtom = atom<CareUnit | null>(null);
export const selectedFavoriteCareUnitsQueryKeyAtom = atom<any[]>([
  'careUnits',
  null,
  null,
  null,
  '',
  false,
]);
