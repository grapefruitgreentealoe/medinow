// recoil/authState.ts
import { atom } from 'recoil';

export const isAdminState = atom<boolean>({
  key: 'isAdminState',
  default: false,
});
