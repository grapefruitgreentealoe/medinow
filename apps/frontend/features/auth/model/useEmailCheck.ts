// features/auth/model/useEmailCheck.ts
import { useMutation } from '@tanstack/react-query';

// 임시 모킹 함수
async function mockCheckEmail(email: string): Promise<boolean> {
  await new Promise((res) => setTimeout(res, 500)); // 지연 시간 흉내
  return email === 'test@example.com'; // 이 이메일만 중복 처리
}

export function useEmailCheck() {
  return useMutation({
    mutationFn: mockCheckEmail,
  });
}
