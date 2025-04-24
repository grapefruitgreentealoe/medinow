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
    if (!careUnit || !departmentId) return;
    await submitReview({
      careUnitId: careUnit.id,
      departmentId,
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
        {[
          {
            name: '가정의학과',
            departmentId: '7fe903a9-a816-4779-9d85-30b7c7a53ade',
          },
          {
            name: '구강안면외과',
            departmentId: '05ec1a10-00c3-4c21-9510-11e2401937de',
          },
          {
            name: '내과',
            departmentId: '25b696fc-f4e6-44ad-bcc6-937e1adedae3',
          },
          {
            name: '마취통증의학과',
            departmentId: 'b6adc034-32c1-45ad-b75b-7fe9e3a4ac77',
          },
          {
            name: '방사선종양학과',
            departmentId: 'bd163443-4752-4c81-9a5f-936e5bd476c0',
          },
          {
            name: '병리과',
            departmentId: '14276349-bb44-4993-805a-0706ef04d870',
          },
          {
            name: '비뇨의학과',
            departmentId: '9b5ef577-a57a-40ca-9b33-71ad244bea00',
          },
          {
            name: '산부인과',
            departmentId: '4951f86e-677e-4c1f-96d1-0acca3facbc4',
          },
          {
            name: '성형외과',
            departmentId: '9861f835-4d6a-46ee-aa33-5e9eb973ed79',
          },
          {
            name: '소아청소년과',
            departmentId: 'a82e46b0-ac3d-419e-a0b9-0626bacf0bd4',
          },
          {
            name: '소아치과',
            departmentId: '06592530-4ae9-4593-9977-981c9db2c8e7',
          },
          {
            name: '신경과',
            departmentId: '2450d432-ea00-43c7-b571-024d35660198',
          },
          {
            name: '신경외과',
            departmentId: '0f65c4fa-f398-4112-9003-27104b3daaa4',
          },
          {
            name: '심장혈관흉부외과',
            departmentId: '88bfabb7-5530-49bf-9514-0f846fa5647f',
          },
          {
            name: '안과',
            departmentId: '4cd6695a-ee1e-4406-9334-7f29260c60b7',
          },
          {
            name: '영상의학과',
            departmentId: '1f3a336b-b8b6-4198-b1da-25a6ac47c086',
          },
          {
            name: '외과',
            departmentId: '3bc6159e-f253-4304-a97f-e3e1395d7158',
          },
          {
            name: '응급의학과',
            departmentId: '24a556ab-1ffa-4e7b-9cc9-deb9e4717625',
          },
          {
            name: '이비인후과',
            departmentId: '951cd45e-3f0f-42db-b915-081ba72a5ce5',
          },
          {
            name: '재활의학과',
            departmentId: '18d09509-b93d-45bc-98c1-84827f99d4c0',
          },
          {
            name: '정신건강의학과',
            departmentId: 'b94fa46d-26e7-4ac6-ba95-191178f335f1',
          },
          {
            name: '정형외과',
            departmentId: '78e056f2-6723-43be-aa65-7bdebf3ab01b',
          },
          {
            name: '진단검사의학과',
            departmentId: 'c8141168-1ebd-4750-9880-fec456ddc2d2',
          },
          {
            name: '치과교정과',
            departmentId: 'd047576e-4f44-4c62-acf7-8fa66da87db2',
          },
          {
            name: '치과보존과',
            departmentId: 'f998ef05-4856-4cdd-8c6a-2a07775c2831',
          },
          {
            name: '치과보철과',
            departmentId: '7aa1fe4d-158f-484f-a2f9-8b6c4bc55c85',
          },
          {
            name: '치주과',
            departmentId: '0068a5e3-77a9-488f-9318-876a9e7de32a',
          },
          {
            name: '피부과',
            departmentId: 'd28dc1be-b405-4237-b1f7-58e97f37762b',
          },
          {
            name: '핵의학과',
            departmentId: '21c105f1-9d76-4eca-8431-9ddef95d492e',
          },
        ].map((d) => (
          <option key={d.name} value={d.departmentId}>
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
