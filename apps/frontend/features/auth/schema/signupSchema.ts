// features/auth/schema/signupSchema.ts
import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email({ message: '유효한 이메일 형식이 아닙니다' }),
  password: z
    .string()
    .min(8, { message: '비밀번호는 최소 8자 이상이어야 합니다' })
    .regex(/[A-Z]/, { message: '대문자를 포함해야 합니다' })
    .regex(/[a-z]/, { message: '소문자를 포함해야 합니다' })
    .regex(/[0-9]/, { message: '숫자를 포함해야 합니다' })
    .regex(/[^A-Za-z0-9]/, { message: '특수문자를 포함해야 합니다' }),
  name: z.string().min(1, { message: '이름을 입력해주세요' }),
  nickname: z.string().min(1, { message: '닉네임을 입력해주세요' }),
  address: z.string().min(1, { message: '주소를 입력해주세요' }),
  age: z.union([z.string().min(1), z.literal('')]).optional(),
  terms: z.literal(true, {
    errorMap: () => ({ message: '약관에 동의해주세요' }),
  }),
});
