import { atom } from 'jotai';

export const careUnitsQueryKeyAtom = atom<any[]>([
  'careUnits',
  null, // roundedLat
  null, // roundedLng
  null, // level
  '', // selectedCategory
  false, // OpenStatus
]);
