'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormSchema, formSchema } from '../schema/reviewSchema';
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
import { Checkbox } from '@/components/ui/checkbox';
import { StarRating } from './StarRating';
import { useAtomValue } from 'jotai';
import {
  selectedCareUnitAtom,
  selectedDepartmentsAtom,
} from '../atoms/reviewFormAtom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ReviewForm({
  defaultValues,
  onSubmit,
  careUnit: careUnitProp,
  departments: departmentsProp,
}: {
  defaultValues?: Partial<FormSchema>;
  onSubmit: (data: any) => void;
  careUnit?: { name: string; address: string };
  departments?: { id: string; name: string }[];
}) {
  const careUnit = careUnitProp ?? useAtomValue(selectedCareUnitAtom); // 새로 작성시 활용하는 atom임.
  const departments = departmentsProp ?? useAtomValue(selectedDepartmentsAtom);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      thankMessage: '',
      departmentId: null,
      rating: 3,
      isPublic: true,
      ...defaultValues,
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = form;

  return (
    <div className="space-y-6 max-w-xl mx-auto py-6">
      <div className="p-4 bg-muted rounded-md">
        <p className="text-sm text-muted-foreground">리뷰 대상 병원</p>
        <p className="font-medium text-lg">{careUnit?.name}</p>
        <p className="text-sm text-muted-foreground">{careUnit?.address}</p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 진료과 선택 */}
          <FormField
            control={control}
            name="departmentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>진료 과</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="진료 과를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 별점 */}
          <FormField
            control={control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>별점</FormLabel>
                <FormControl>
                  <Card className="p-4">
                    <StarRating
                      value={field.value}
                      onChange={(val) => setValue('rating', val)}
                    />
                    <p className="text-sm mt-2 text-muted-foreground">
                      선택한 별점: {field.value}점
                    </p>
                  </Card>
                </FormControl>
              </FormItem>
            )}
          />

          {/* 리뷰 내용 */}
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

          {/* 감사 메시지 */}
          <FormField
            control={control}
            name="thankMessage"
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

          {/* 공개 여부 */}
          <FormField
            control={control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                </FormControl>
                <FormLabel className="text-sm">리뷰를 공개할래요</FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? '처리 중...'
              : defaultValues
                ? '리뷰 수정'
                : '리뷰 등록'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
