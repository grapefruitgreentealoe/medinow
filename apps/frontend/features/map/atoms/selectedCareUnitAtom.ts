import { atom } from 'jotai';
import { CareUnit } from '@/shared/type';
export const selectedCareUnitAtom = atom<CareUnit | null>(null);
