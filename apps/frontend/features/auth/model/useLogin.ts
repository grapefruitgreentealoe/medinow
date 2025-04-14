// features/auth/model/useLogin.ts
import { useMutation } from '@tanstack/react-query';

const mockLogin = async (data: { email: string; password: string }) => {
  await new Promise((res) => setTimeout(res, 500));
  if (data.email === 'test@example.com' && data.password === 'password123') {
    return { accessToken: 'mocked-access-token' };
  }
  throw new Error('이메일 또는 비밀번호가 일치하지 않습니다');
};

export function useLogin() {
  return useMutation({
    mutationFn: mockLogin,
  });
}
