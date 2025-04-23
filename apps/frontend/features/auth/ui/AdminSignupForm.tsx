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
import { Select } from '@/components/ui/select';

export default function AdminSignupForm() {
  const router = useRouter();
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(false);

  const form = useForm<AdminSignupData>({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: {
      email: 'test@clinic.com',
      password: 'Test1234!',
      name: '홍길동',
      latitude: 37.5665,
      longitude: 126.978,
      careUnitName: '테스트병원',
      careUnitAddress: '서울특별시 종로구 세종대로 110',
      careUnitCategory: '',
      imageUrl: '',
    },
  });

  const setValue = form.setValue;

  const handleHospitalSelect = (data: {
    name: string;
    address: string;
    lat: string;
    lng: string;
  }) => {
    setValue('careUnitName', data.name, { shouldDirty: true });
    setValue('careUnitAddress', data.address, { shouldDirty: true });
    setValue('longitude', parseFloat(data.lng), { shouldDirty: true });
    setValue('latitude', parseFloat(data.lat), { shouldDirty: true });
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      setUploading(true);
      const res = await axiosInstance.post(
        '/images/business-license/upload',
        formData
      );
      setValue('imageUrl', res.data.url, { shouldDirty: true });
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: AdminSignupData) => {
    setChecking(true);
    const isDuplicated = await checkEmail(data.email);
    setChecking(false);

    if (isDuplicated) {
      form.setError('email', { message: '이미 사용 중인 이메일입니다' });
      return;
    }

    const signupData = {
      ...data,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
    };

    await adminSignup(signupData);
    router.push(ROUTES.HOME);
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

          {/* 병원 검색 버튼 */}
          <FormItem>
            <FormLabel>병원 검색</FormLabel>
            <FormControl>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setHospitalModalOpen(true)}
              >
                병원 검색
              </Button>
            </FormControl>
          </FormItem>

          <FormField
            control={form.control}
            name="careUnitName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>기관명</FormLabel>
                <FormControl>
                  <Input placeholder="의료기관명" {...field} disabled />
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
                  <Input placeholder="의료기관 주소" {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {/* 이미지 업로드 */}
          <FormItem>
            <FormLabel>사업자 등록증 업로드</FormLabel>
            <FormControl>
              <>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => inputFileRef.current?.click()}
                  disabled={uploading}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  {uploading ? '업로드 중...' : '이미지 선택하기'}
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  ref={inputFileRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </>
            </FormControl>
            <FormMessage>{form.formState.errors.imageUrl?.message}</FormMessage>
          </FormItem>

          {/* 숨겨진 필드 */}
          <input type="hidden" {...form.register('latitude')} />
          <input type="hidden" {...form.register('longitude')} />
          <input type="hidden" {...form.register('imageUrl')} />

          <Button
            type="submit"
            disabled={uploading || checking}
            className="w-full"
          >
            {checking ? '이메일 확인 중...' : '회원가입'}
          </Button>
        </form>
      </Form>

      {/* 병원 검색 모달 */}
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
