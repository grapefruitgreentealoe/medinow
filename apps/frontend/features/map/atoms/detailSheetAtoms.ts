import { atom } from 'jotai';
import { CareUnit } from '@/features/map/type';

export const detailSheetOpenAtom = atom(false);
export const detailSheetPageAtom = atom<'list' | 'detail'>('list');
