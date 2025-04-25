import { z } from 'zod';

export const formSchema = z.object({
  content: z.string().min(10, '리뷰는 10자 이상 입력해주세요.'),
  thankMessage: z.string().optional(),
  departmentId: z.string().optional(),
  rating: z.number().min(1).max(5),
  isPublic: z.boolean(),
});

export type FormSchema = z.infer<typeof formSchema>;
