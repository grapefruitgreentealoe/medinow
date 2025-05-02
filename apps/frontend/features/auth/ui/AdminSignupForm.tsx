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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SelectSeparator } from '@/components/ui/select';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

export default function AdminSignupForm() {
  const router = useRouter();
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(false);

  const form = useForm<AdminSignupData & { isCareUnitVerified: boolean }>({
    resolver: zodResolver(adminSignupSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      careUnitName: '',
      careUnitAddress: '',
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

    handleCareUnitValidation();
  };

  const handleCareUnitValidation = async () => {
    const { careUnitName, careUnitAddress, careUnitCategory } =
      form.getValues();

    if (!careUnitName || !careUnitAddress || !careUnitCategory) {
      toast.warning('기관주소, 유형을 모두 입력해주세요.');
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
        toast.warning('등록되지 않은 의료기관입니다.');
        setValue('isCareUnitVerified', false);
        setValue('careUnitName', '');
        setValue('careUnitAddress', '');
      }
    } catch (e: any) {
      console.log(e);
      if (e.status == 500) {
        toast.warning('등록되지 않은 의료기관입니다.');
        setValue('isCareUnitVerified', false);
        setValue('careUnitName', '');
        setValue('careUnitAddress', '');
      }
    }
  };

  const onSubmit = async (data: AdminSignupData) => {
    const isCareUnitVerified = form.getValues('isCareUnitVerified');
    if (!isCareUnitVerified) {
      toast.warning('의료기관 확인을 완료해주세요.');
      return;
    }

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

  const handleClickHospitalInput = () => {
    if (form.getValues('careUnitCategory') === '') {
      toast.warning('의료기관 유형을 선택해주세요.');
      return;
    }
    setHospitalModalOpen(true);
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emergency">응급실</SelectItem>
                      <SelectItem value="hospital">병원</SelectItem>
                      <SelectItem value="pharmacy">약국</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.getValues('careUnitAddress') ? (
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
          ) : null}

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
                      className="flex-1"
                      onClick={handleClickHospitalInput}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch('isCareUnitVerified') && (
            <p className="text-green-600 text-sm">가입 가능한 의료기관입니다</p>
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
                    placeholder="8자 이상,대소문자,숫자,특수문자 포함"
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

      {hospitalModalOpen ? (
        <LocationSearchModal
          title="의료기관 위치 검색"
          subtitle="의료기관명을 통해 검색하세요"
          open={true}
          onClose={() => setHospitalModalOpen(false)}
          onSelect={handleHospitalSelect}
        />
      ) : null}
    </>
  );
}
