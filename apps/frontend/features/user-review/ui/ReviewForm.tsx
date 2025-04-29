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
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { StarRating } from './StarRating';
import { useAtomValue, useSetAtom } from 'jotai';
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
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useState } from 'react';

export function ReviewForm({
  isEditing = false,
  defaultValues,
  onSubmit,
  careUnit: careUnitProp,
  departments: departmentsProp,
}: {
  isEditing?: boolean;
  defaultValues?: Partial<FormSchema>;
  onSubmit: (data: any) => void;
  careUnit?: { name: string; address: string };
  departments?: { id: string; name: string }[];
}) {
  const careUnit = careUnitProp ?? useAtomValue(selectedCareUnitAtom);
  const departments = departmentsProp ?? useAtomValue(selectedDepartmentsAtom);
  const setCareUnit = useSetAtom(selectedCareUnitAtom);
  const setDepartments = useSetAtom(selectedDepartmentsAtom);
  const [open, setOpen] = useState<boolean>(false);
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

  const onResetHospital = () => {
    setCareUnit(null);
    setDepartments([]);
  };

  const onClickReChoiceButton = () => {
    setOpen(true);
  };

  return (
    <div className="!space-y-6 max-w-xl mx-auto py-6">
      {/* 병원정보 */}
      <Card className="bg-muted/50 border">
        <CardContent className="!space-y-1">
          <p className="text-xs text-muted-foreground">리뷰 대상 의료기관</p>
          <h3 className="text-base font-bold">{careUnit?.name}</h3>
          <p className="text-sm text-muted-foreground">{careUnit?.address}</p>
          {!isEditing ? (
            <Button onClick={onClickReChoiceButton}>다시 선택</Button>
          ) : null}
        </CardContent>
      </Card>

      {/* 리뷰 작성 */}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="!space-y-4">
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
                    <SelectContent aria-disabled>
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

          <FormField
            control={control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>별점</FormLabel>
                <FormControl>
                  <div>
                    <StarRating
                      value={field.value}
                      onChange={(val) => setValue('rating', val)}
                    />
                    <p className="text-sm mt-2 text-muted-foreground">
                      선택한 별점: {field.value}점
                    </p>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

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

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting
              ? '처리 중...'
              : defaultValues
                ? '리뷰 수정'
                : '리뷰 등록'}
          </Button>
        </form>
      </Form>
      <ConfirmDialog
        confirmVariant="destructive"
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title="다시 선택하시겠습니까?"
        onConfirm={() => {
          onResetHospital();
        }}
        description="아래 작성한 내용들이 사라질 수 있습니다"
      />
    </div>
  );
}
