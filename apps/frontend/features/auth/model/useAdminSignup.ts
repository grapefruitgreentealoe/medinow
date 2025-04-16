import { useMutation } from '@tanstack/react-query';
import type { SignupData } from '../type';

// 임시 모킹 함수
async function mockAdminSignup(data: SignupData) {
  console.log('[MOCK] 회원가입 데이터', data);
  await new Promise((res) => setTimeout(res, 700));
  return { success: true };
}

export const useAdminSignup = () => {
  return useMutation({
    mutationFn: mockAdminSignup,
  });
};
