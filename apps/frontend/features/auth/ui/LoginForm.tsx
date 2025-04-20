'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schema/loginSchema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { login } from '../api';

type FormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'test@example.com',
      password: 'Abcd1234!',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);

      // SSR에 반영되기 전이라도 클라이언트에서 isLoggedIn 즉시 반영
      if (typeof window !== 'undefined') {
        window.__INITIAL_IS_LOGGED_IN__ = true;
      }

      // SSR 새로고침 유도
      // 쿠키 저장이 완료될 시간 주기 (200~500ms 사이)
      setTimeout(() => {
        location.href = '/';
      }, 1000);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md mx-auto"
    >
      <Input placeholder="이메일" {...register('email')} />
      {errors.email && (
        <p className="text-sm text-red-500">{errors.email.message}</p>
      )}

      <Input type="password" placeholder="비밀번호" {...register('password')} />
      {errors.password && (
        <p className="text-sm text-red-500">{errors.password.message}</p>
      )}
      <Button type="submit" className="w-full">
        로그인
      </Button>
    </form>
  );
}
