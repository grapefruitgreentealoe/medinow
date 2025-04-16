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
import type { SignupData } from '../type';

type FormData = z.infer<typeof adminSignupSchema>;
import { useState } from 'react';
import HospitalSearchModal from '@/components/HospitalSearchModal';

export default function AdminSignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: {
      email: 'admin@clinic.com',
      password: 'Admin123!',
      managerName: '홍길동',
      address: '서울특별시 강남구 역삼동',
      medicalCenterName: '',
      businessHourStart: '09:00',
      businessHourEnd: '18:00',
      institutionType: '병원',
      terms: true,
      lat: '',
      lng: '',
    },
  });
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const handleHospitalSelect = (data: {
    name: string;
    address: string;
    lat: string;
    lng: string;
  }) => {
    setValue('address', data.address);
    setValue('medicalCenterName', data.name);
    setValue('lat', data.lat);
    setValue('lng', data.lng);
  };
  const { mutateAsync: signupAdmin } = useAdminSignup();

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

    const signupData: SignupData = Object.fromEntries(
      formData.entries()
    ) as unknown as SignupData;
    await signupAdmin(signupData);
    router?.push('/');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit);
      }}
      className="space-y-4"
    >
      <Input placeholder="이메일" {...register('email')} />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <Input type="password" placeholder="비밀번호" {...register('password')} />
      {errors.password && (
        <p className="text-red-500">{errors.password.message}</p>
      )}

      <Input placeholder="담당자 이름" {...register('managerName')} />
      <div className="space-y-1">
        <label className="text-sm">병원 검색</label>
        <button
          type="button"
          onClick={() => setHospitalModalOpen(true)}
          className="border p-2 rounded w-full bg-gray-50 text-left"
        >
          병원 검색 팝업 열기
        </button>
      </div>

      <Input placeholder="병원명" {...register('medicalCenterName')} />
      <Input placeholder="주소" {...register('address')} />
      <input type="hidden" {...register('lat')} />
      <input type="hidden" {...register('lng')} />

      <HospitalSearchModal
        open={hospitalModalOpen}
        onClose={() => setHospitalModalOpen(false)}
        onSelect={handleHospitalSelect}
      />

      {/* 좌표 hidden input */}
      <input type="hidden" {...register('lat')} />
      <input type="hidden" {...register('lng')} />

      {/* <span>{getValue}</span> */}
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
