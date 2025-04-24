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
  name: z.string().min(1, '담당자명을 입력해주세요'),
  careUnitName: z.string().min(1, '기관명을 입력해주세요'),
  careUnitAddress: z.string().min(1, '기관 주소를 입력해주세요'),
  careUnitCategory: z.string().min(1, '기관 유형을 선택해주세요'),

  imageUrl: z.string().optional(),
  isCareUnitVerified: z.boolean(),
});
