import { atom } from 'jotai';
import { CareUnit } from '@/shared/type';

export const detailSheetOpenAtom = atom(false);
export const detailSheetPageAtom = atom<'list' | 'detail'>('list');
