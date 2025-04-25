// features/user-review/atoms/editReviewAtom.ts
import { atom } from 'jotai';
import { ReviewData, UpdateReviewInput } from '../type';

export const editReviewAtom = atom<ReviewData | null>(null);
