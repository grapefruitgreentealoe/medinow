'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../schema/signupSchema';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useEmailCheck } from '../model/useEmailCheck';
import { useState } from 'react';

type FormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(signupSchema),
  });

  const { mutateAsync: checkEmail } = useEmailCheck();
  const [checking, setChecking] = useState(false);

  const onSubmit = async (data: FormData) => {
    setChecking(true);
    const isDuplicated = await checkEmail(data.email);
    setChecking(false);
    if (isDuplicated) {
      setError('email', { message: '이미 사용 중인 이메일입니다' });
      return;
    }

    // TODO: 회원가입 API 연동
    console.log('회원가입 성공', data);
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

      <Input placeholder="이름" {...register('name')} />
      {errors.name && (
        <p className="text-sm text-red-500">{errors.name.message}</p>
      )}

      <Input placeholder="닉네임" {...register('nickname')} />
      {errors.nickname && (
        <p className="text-sm text-red-500">{errors.nickname.message}</p>
      )}

      <Input placeholder="읍/면/동 주소" {...register('address')} />
      {errors.address && (
        <p className="text-sm text-red-500">{errors.address.message}</p>
      )}

      <Input placeholder="나이 (선택)" {...register('age')} />
      {errors.age && (
        <p className="text-sm text-red-500">{errors.age.message}</p>
      )}

      <div className="flex items-center gap-2">
        <Checkbox id="terms" {...register('terms')} />
        <label htmlFor="terms" className="text-sm">
          약관에 동의합니다
        </label>
      </div>
      {errors.terms && (
        <p className="text-sm text-red-500">{errors.terms.message}</p>
      )}

      <Button type="submit" disabled={checking}>
        {checking ? '이메일 확인 중...' : '회원가입'}
      </Button>
    </form>
  );
}
