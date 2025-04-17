'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schema/loginSchema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { login } from '../api';
import { useAuthStore } from '@/store/useAuthStore';

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

  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      const result = await login(data);
      // 로그인 성공 후
      useAuthStore.getState().setAuth({
        isLoggedIn: true,
        isAdmin: true, // 또는 false
      });
      localStorage.setItem('isAdmin', result.isAdmin);
      localStorage.setItem('isLogin', 'true');
      router.push('/');
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
