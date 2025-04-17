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
  latitude: z.preprocess(
    (val) => Number(val),
    z.number({
      required_error: '위도를 입력해주세요',
      invalid_type_error: '위도는 숫자여야 합니다',
    })
  ),
  longitude: z.preprocess(
    (val) => Number(val),
    z.number({
      required_error: '경도를 입력해주세요',
      invalid_type_error: '경도는 숫자여야 합니다',
    })
  ),
  careUnitName: z.string().min(1, '기관명을 입력해주세요'),
  careUnitAddress: z.string().min(1, '기관 주소를 입력해주세요'),
  careUnitCategory: z.string().min(1, '기관 유형을 선택해주세요'),

  imageUrl: z.string().url('올바른 이미지 URL 형식이 아닙니다').optional(),
});
