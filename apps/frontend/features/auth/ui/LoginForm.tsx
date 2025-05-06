'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schema/loginSchema';
import { login } from '../api';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSetAtom } from 'jotai';
import { isLoggedInAtom } from '@/atoms/auth';

type FormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const setIsLoggedIn = useSetAtom(isLoggedInAtom);
  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: FormData) => {
    try {
      await login(data);
      setIsLoggedIn(true);
      toast.success('로그인에 성공했어요!');
      setTimeout(() => {
        location.href = '/';
      }, 1000);
    } catch (e) {
      const errorMessage =
        (e as Error)?.message || '로그인 중 문제가 발생했습니다.';
      toast.error(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="!space-y-6 !max-w-md !mx-auto"
      >
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input placeholder="example@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input type="password" placeholder="비밀번호 입력" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? '로그인 중...' : '로그인'}
        </Button>
      </form>
    </Form>
  );
}
