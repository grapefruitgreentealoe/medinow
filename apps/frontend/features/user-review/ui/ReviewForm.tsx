'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { submitReview } from '../api';
import { useAtomValue } from 'jotai';
import {
  selectedCareUnitAtom,
  selectedDepartmentIdAtom,
  selectedDepartmentsAtom,
} from '../atoms/reviewFormAtom';
import { StarRating } from './StarRating';

const formSchema = z.object({
  content: z.string().min(10, '리뷰는 10자 이상 입력해주세요.'),
  thanksMessage: z.string().optional(),
});

type FormSchema = z.infer<typeof formSchema>;

export function ReviewForm() {
  const careUnit = useAtomValue(selectedCareUnitAtom);
  const departments = useAtomValue(selectedDepartmentsAtom);
  const [departmentId, setDepartmentId] = useState<string>('');
  const [rating, setRating] = useState(3);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      thanksMessage: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (values: FormSchema) => {
    if (!careUnit) return;
    await submitReview({
      careUnitId: careUnit.id,
      departmentId: 'b9adcad8-bc9c-4fd9-b4e0-2daa93328510',
      content: values.content,
      thankMessage: values.thanksMessage,
      rating,
      isPublic: true,
    });
    alert('리뷰가 등록되었습니다!');
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto py-6">
      <div className="p-4 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">리뷰 대상 병원</p>
        <p className="font-medium text-lg">{careUnit?.name}</p>
        <p className="text-sm text-muted-foreground">{careUnit?.address}</p>
      </div>

      <label className="text-sm font-medium">진료 과 선택</label>
      <select
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="">진료 과를 선택하세요</option>
        {departments.map((d) => (
          <option key={d.name} value={d.id}>
            {d.name}
          </option>
        ))}
      </select>

      <Card className="p-4">
        <p className="text-sm font-medium mb-2">별점</p>
        <StarRating value={rating} onChange={setRating} />
        <p className="text-sm mt-2 text-muted-foreground">
          선택한 별점: {rating}점
        </p>
      </Card>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>리뷰 내용</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="리뷰 내용을 10자 이상 작성해주세요."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="thanksMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>감사 메시지 (선택)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="간단한 감사 인사를 남겨보세요."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '등록 중...' : '리뷰 등록'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
