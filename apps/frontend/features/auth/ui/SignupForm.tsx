'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '../schema/signupSchema';
import { z } from 'zod';
import { useState } from 'react';
import { checkEmail, signup } from '../api';
import { ROUTES } from '@/shared/constants/routes';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LocationSearchModal from '@/shared/ui/LocationSearchModal';

type FormData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: 'test@example.com',
      password: 'Abcd1234!',
      name: '테스터',
      nickname: '테스트닉',
      address: '서울시 강남구',
      age: '29',
    },
  });

  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const onSubmit = async (data: FormData) => {
    setChecking(true);
    const isDuplicated = await checkEmail(data.email);
    setChecking(false);
    if (isDuplicated) {
      form.setError('email', { message: '이미 사용 중인 이메일입니다' });
      return;
    }

    setLoading(true);
    await signup({
      ...data,
      age: Number(data.age),
    });
    setLoading(false);

    router.push(ROUTES.LOGIN);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="!space-y-6 !max-w-md !mx-auto"
        >
          <FormField
            control={form.control}
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
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="비밀번호 입력"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이름</FormLabel>
                <FormControl>
                  <Input placeholder="홍길동" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nickname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>닉네임</FormLabel>
                <FormControl>
                  <Input placeholder="사용할 닉네임" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>주소</FormLabel>
                <FormControl>
                  <Input
                    placeholder="읍/면/동 단위 주소"
                    {...field}
                    readOnly
                    onClick={() => setModalOpen(true)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>나이 (선택)</FormLabel>
                <FormControl>
                  <Input placeholder="숫자 입력" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={checking || loading}
            className="w-full"
          >
            {checking ? '이메일 확인 중...' : '회원가입'}
          </Button>
        </form>
      </Form>
      {modalOpen ? (
        <LocationSearchModal
          title="주소 검색"
          subtitle="키워드를 통해 검색하세요"
          open={true}
          onClose={() => setModalOpen(false)}
          onSelect={(data) => {
            form.setValue('address', data.address);
            setModalOpen(false);
          }}
        />
      ) : null}
    </>
  );
}
