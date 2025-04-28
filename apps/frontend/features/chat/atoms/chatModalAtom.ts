import { atom } from 'jotai';
import { CareUnit } from '@/shared/type';

interface ChatModalState {
  isOpen: boolean;
  target: CareUnit | null;
}

export const chatModalAtom = atom<ChatModalState>({
  isOpen: false,
  target: null,
});
