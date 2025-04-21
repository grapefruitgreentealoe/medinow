// features/chat/store/chat-store.ts
import { atom } from 'recoil';
import { CareUnit } from '@/features/map/type';

export const chatModalState = atom<{
  isOpen: boolean;
  target: CareUnit | null;
}>({
  key: 'chatModalState',
  default: {
    isOpen: false,
    target: null,
  },
});
