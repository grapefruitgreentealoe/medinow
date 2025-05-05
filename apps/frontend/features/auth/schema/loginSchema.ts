import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: '유효한 이메일을 입력해주세요' }),
  password: z
    .string()
    .min(8, '8자 이상 입력해주세요')
    .regex(
      /(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
      '대/소문자, 숫자, 특수문자를 포함해야 합니다'
    ),
});
