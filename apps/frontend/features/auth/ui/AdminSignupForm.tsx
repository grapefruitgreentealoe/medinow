'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminSignupSchema } from '@/features/auth/schema/adminSignupSchema';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { adminSignup, checkEmail } from '../api';
import LocationSearchModal from '@/shared/ui/LocationSearchModal';
import type { AdminSignupData } from '../type';
import axiosInstance from '@/lib/axios';
import { ROUTES } from '@/shared/constants/routes';
import { UploadCloud } from 'lucide-react';
import { checkCareUnitExist } from '@/shared/api';

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
import { Separator } from '@radix-ui/react-select';
import { SelectSeparator } from '@/components/ui/select';

export default function AdminSignupForm() {
  const router = useRouter();
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(false);

  const form = useForm<AdminSignupData & { isCareUnitVerified: boolean }>({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: {
      email: 'test@clinic.com',
      password: 'Test1234!',
      name: '홍길동',

      careUnitName: '테스트병원',
      careUnitAddress: '서울특별시 종로구 세종대로 110',
      careUnitCategory: '',
      isCareUnitVerified: false,
    },
  });

  const setValue = form.setValue;

  const handleHospitalSelect = async (data: {
    name: string;
    address: string;
    lat: string;
    lng: string;
  }) => {
    setValue('careUnitName', data.name, { shouldDirty: true });
    setValue('careUnitAddress', data.address, { shouldDirty: true });
    form.clearErrors('isCareUnitVerified');
    setValue('isCareUnitVerified', false); // 유효성 검사 초기화
  };

  const handleCareUnitValidation = async () => {
    const { careUnitName, careUnitAddress, careUnitCategory } =
      form.getValues();

    if (!careUnitName || !careUnitAddress || !careUnitCategory) {
      alert('기관명, 주소, 유형을 모두 입력해주세요.');
      return;
    }

    try {
      const exists = await checkCareUnitExist({
        name: careUnitName,
        address: careUnitAddress,
        category: careUnitCategory,
      });

      if (exists) {
        setValue('isCareUnitVerified', true, { shouldDirty: true });
      } else {
        alert('등록되지 않은 병원입니다.');
        setValue('isCareUnitVerified', false);
      }
    } catch (e) {
      alert('병원 확인 중 오류가 발생했습니다.');
    }
  };
  console.log(form.formState.errors);

  const onSubmit = async (data: AdminSignupData) => {
    const isCareUnitVerified = form.getValues('isCareUnitVerified');
    if (!isCareUnitVerified) {
      alert('병원 확인을 완료해주세요.');
      return;
    }

    console.log('submit');
    setChecking(true);
    const isDuplicated = await checkEmail(data.email);
    setChecking(false);

    if (isDuplicated) {
      form.setError('email', { message: '이미 사용 중인 이메일입니다' });
      return;
    }

    await adminSignup(data);
    router.push(ROUTES.LOGIN);
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="!space-y-3 !max-w-md !mx-auto"
        >
          <FormField
            control={form.control}
            name="careUnitCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>의료기관 유형</FormLabel>
                <FormControl>
                  <select {...field} className="w-full border rounded p-2">
                    <option value="">선택하세요</option>
                    <option value="emergency">응급실</option>
                    <option value="hospital">병원</option>
                    <option value="pharmacy">약국</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="careUnitName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>기관명</FormLabel>
                <FormControl>
                  <Input
                    placeholder="의료기관명"
                    {...field}
                    readOnly
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="careUnitAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>기관 주소</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      placeholder="의료기관 주소"
                      {...field}
                      readOnly
                      disabled
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setHospitalModalOpen(true)}
                    >
                      병원 검색
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="button"
            variant="default"
            onClick={handleCareUnitValidation}
            className="w-full bg-blend-soft-light"
          >
            가입가능 여부 확인
          </Button>

          {form.watch('isCareUnitVerified') && (
            <p className="text-green-600 text-sm">가입 가능한 병원입니다</p>
          )}

          <input type="hidden" {...form.register('isCareUnitVerified')} />
          <SelectSeparator className="!my-[20px]" />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>관리자명</FormLabel>
                <FormControl>
                  <Input placeholder="홍길동" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input placeholder="example@clinic.com" {...field} />
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

          <Button
            type="submit"
            disabled={uploading || checking}
            className="w-full"
          >
            {checking ? '이메일 확인 중...' : '회원가입'}
          </Button>
        </form>
      </Form>

      <LocationSearchModal
        title="병원 위치 검색"
        subtitle="병원명을 통해 검색하세요"
        open={hospitalModalOpen}
        onClose={() => setHospitalModalOpen(false)}
        onSelect={handleHospitalSelect}
      />
    </>
  );
}
