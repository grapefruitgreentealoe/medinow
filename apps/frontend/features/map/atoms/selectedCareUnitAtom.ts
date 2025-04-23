import { atom } from 'jotai';
import { CareUnit } from '@/features/map/type';

export const selectedCareUnitAtom = atom<CareUnit | null>(null);
