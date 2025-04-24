import { atom } from 'jotai';
import { CareUnit } from '@/features/map/type';

export const selectedCareUnitIdAtom = atom<string | null>(null);
export const selectedCareUnitAtom = atom<CareUnit | null>(null);

export const selectedDepartmentsAtom = atom<{ id: string; name: string }[]>([]);
export const selectedDepartmentIdAtom = atom<string | null>(null);
