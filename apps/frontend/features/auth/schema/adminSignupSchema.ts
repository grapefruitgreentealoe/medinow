import { z } from 'zod';

export const adminSignupSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z
    .string()
    .min(8, '8자 이상 입력해주세요')
    .regex(
      /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
      '대/소문자, 숫자, 특수문자를 포함해야 합니다'
    ),
  managerName: z.string().min(1, '담당자 이름을 입력해주세요'),
  contact: z.string().min(1, '연락처를 입력해주세요'),
  lat: z.string().min(1, '연락처를 입력해주세요'),
  lng: z.string().min(1, '연락처를 입력해주세요'),
  medicalCenterName: z.string(),
  address: z.string().min(1, '주소를 입력해주세요'),
  businessHourStart: z.string().min(1, '운영 시작 시간을 입력해주세요'),
  businessHourEnd: z.string().min(1, '운영 종료 시간을 입력해주세요'),
  institutionType: z.enum(['응급실', '병원', '약국'], {
    errorMap: () => ({ message: '기관 유형을 선택해주세요' }),
  }),
  businessLicense: z
    .any()
    .refine((file) => file instanceof FileList && file.length > 0, {
      message: '사업자등록증 이미지를 업로드해주세요',
    }),
  terms: z.literal(true, {
    errorMap: () => ({ message: '약관 동의는 필수입니다' }),
  }),
});
