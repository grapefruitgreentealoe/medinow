'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminSignupSchema } from '@/features/auth/schema/adminSignupSchema';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAdminSignup } from '../model/useAdminSignup';
import { useRouter } from 'next/navigation';

type FormData = z.infer<typeof adminSignupSchema>;

export default function AdminSignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: {
      email: 'admin@clinic.com',
      password: 'Admin123!',
      managerName: '홍길동',
      institutionName: '강남의원',
      contact: '02-123-4567',
      address: '서울특별시 강남구 역삼동',
      businessHourStart: '09:00',
      businessHourEnd: '18:00',
      medicalLicenseNumber: 'MED-2024-0001',
      institutionType: '병원',
      terms: true,
    },
  });

  const { mutateAsync: signupAdmin, isPending } = useAdminSignup();

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    for (const key in data) {
      const value = data[key as keyof FormData];
      if (value instanceof FileList) {
        formData.append(key, value[0]);
      } else {
        formData.append(key, value as string);
      }
    }

    await signupAdmin(formData);
    router?.push('/');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input placeholder="이메일" {...register('email')} />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <Input type="password" placeholder="비밀번호" {...register('password')} />
      {errors.password && (
        <p className="text-red-500">{errors.password.message}</p>
      )}

      <Input placeholder="담당자 이름" {...register('managerName')} />
      <Input placeholder="기관명" {...register('institutionName')} />
      <Input placeholder="연락처" {...register('contact')} />
      <Input placeholder="주소" {...register('address')} />
      <div className="flex items-center gap-2">
        <div className="w-1/2">
          <label className="text-sm">운영 시작</label>
          <Input type="time" {...register('businessHourStart')} />
          {errors.businessHourStart && (
            <p className="text-red-500 text-sm">
              {errors.businessHourStart.message}
            </p>
          )}
        </div>
        <div className="w-1/2">
          <label className="text-sm">운영 종료</label>
          <Input type="time" {...register('businessHourEnd')} />
          {errors.businessHourEnd && (
            <p className="text-red-500 text-sm">
              {errors.businessHourEnd.message}
            </p>
          )}
        </div>
      </div>

      <Input
        placeholder="의료기관 허가번호"
        {...register('medicalLicenseNumber')}
      />

      <label className="text-sm">의료기관 유형</label>
      <select
        {...register('institutionType')}
        className="border p-2 rounded w-full"
      >
        <option value="">선택하세요</option>
        <option value="응급실">응급실</option>
        <option value="병원">병원</option>
        <option value="약국">약국</option>
      </select>
      {errors.institutionType && (
        <p className="text-red-500">{errors.institutionType.message}</p>
      )}

      <Input type="file" accept="image/*" {...register('businessLicense')} />
      {errors.businessLicense && (
        <p className="text-red-500">
          {errors.businessLicense?.message?.toString()}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Checkbox id="terms" {...register('terms')} />
        <label htmlFor="terms" className="text-sm">
          약관에 동의합니다
        </label>
      </div>
      {errors.terms && <p className="text-red-500">{errors.terms.message}</p>}

      <Button type="submit">회원가입</Button>
    </form>
  );
}
