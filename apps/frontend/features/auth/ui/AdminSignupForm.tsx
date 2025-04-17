'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminSignupSchema } from '@/features/auth/schema/adminSignupSchema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { adminSignup, checkEmail } from '../api';
import HospitalSearchModal from '@/components/HospitalSearchModal';
import type { AdminSignupData } from '../type';
import { UploadCloud } from 'lucide-react';
import { Label } from '@/components/ui/label';
import axiosInstance from '@/lib/axios';

export default function AdminSignupForm() {
  const router = useRouter();
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: {
      email: 'test@clinic.com',
      password: 'Test1234!',
      name: '홍길동',
      latitude: '37.5665',
      longitude: '126.978',
      careUnitName: '테스트병원',
      careUnitAddress: '서울특별시 종로구 세종대로 110',
      careUnitCategory: '병원',
      imageUrl: 'https://via.placeholder.com/150',
    },
  });

  const handleHospitalSelect = (data: {
    name: string;
    address: string;
    lat: string;
    lng: string;
  }) => {
    console.log(data);
    setValue('careUnitName', data.name, { shouldDirty: true });
    setValue('careUnitAddress', data.address, { shouldDirty: true });
    setValue('longitude', data.lng, { shouldDirty: true });
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await axiosInstance.post('/images', {
        method: 'POST',
        body: formData,
      });

      // setValue('imageUrl', res.url, { shouldDirty: true });
    } catch (error) {
      alert('이미지 업로드에 실패했습니다.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: AdminSignupData) => {
    setChecking(true);
    const isDuplicated = await checkEmail(data.email);
    setChecking(false);
    if (isDuplicated) {
      setError('email', { message: '이미 사용 중인 이메일입니다' });
      return;
    }

    const signupData: AdminSignupData = {
      ...data,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
    };
    console.log(signupData);
    await adminSignup(signupData);
    setLoading(false);
    router.push('/');
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-md mx-auto"
    >
      <Input placeholder="관리자명" {...register('name')} />
      {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      <Input placeholder="이메일" {...register('email')} />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}

      <Input type="password" placeholder="비밀번호" {...register('password')} />
      {errors.password && (
        <p className="text-red-500">{errors.password.message}</p>
      )}

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

      <Input placeholder="기관명" {...register('careUnitName')} />
      {errors.careUnitName && (
        <p className="text-red-500">{errors.careUnitName.message}</p>
      )}

      <Input placeholder="기관 주소" {...register('careUnitAddress')} />
      {errors.careUnitAddress && (
        <p className="text-red-500">{errors.careUnitAddress.message}</p>
      )}

      <HospitalSearchModal
        open={hospitalModalOpen}
        onClose={() => setHospitalModalOpen(false)}
        onSelect={handleHospitalSelect}
      />

      <label className="text-sm">의료기관 유형</label>
      <select
        {...register('careUnitCategory')}
        className="border p-2 rounded w-full"
      >
        <option value="">선택하세요</option>
        <option value="emergency">응급실</option>
        <option value="hospital">병원</option>
        <option value="pharmacy">약국</option>
      </select>
      {errors.careUnitCategory && (
        <p className="text-red-500">{errors.careUnitCategory.message}</p>
      )}

      <Label className="text-sm">사업자 등록증 업로드</Label>
      <Button
        type="button"
        variant="secondary"
        className="w-full"
        disabled={uploading}
        onClick={() => inputFileRef.current?.click()}
      >
        <UploadCloud className="mr-2 h-4 w-4" />
        {uploading ? '업로드 중...' : '이미지 선택하기'}
      </Button>
      <Input
        id="picture"
        type="file"
        accept="image/*"
        ref={inputFileRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
        }}
        className="hidden"
      />
      {errors.imageUrl && (
        <p className="text-red-500 text-sm">{errors.imageUrl.message}</p>
      )}

      {/* 숨겨진 위도/경도/imageUrl 필드 */}
      <input type="hidden" {...register('latitude')} />
      <input type="hidden" {...register('longitude')} />
      <input type="hidden" {...register('imageUrl')} />

      <Button type="submit" disabled={uploading || loading} className="w-full">
        {uploading ? '업로드 중...' : loading ? '이메일 체크중' : '회원가입'}
      </Button>
    </form>
  );
}
