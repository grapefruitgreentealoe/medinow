// atoms/unfavoriteConfirmModalAtom.ts
import { CareUnit } from '@/shared/type';
import { atom } from 'jotai';

export const unfavoriteConfirmUnitAtom = atom<CareUnit | null>(null);
