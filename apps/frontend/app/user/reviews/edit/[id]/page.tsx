'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getReviewById, updateReview } from '@/features/user-review/api';
import { getCareUnitById } from '@/shared/api';
import { ReviewForm } from '@/features/user-review/ui/ReviewForm';
import { FormSchema } from '@/features/user-review/schema/reviewSchema';
import { editReviewAtom } from '@/features/user-review/atoms/editReviewAtom';
import { createStore, Provider, useAtomValue } from 'jotai';
import { ReviewData, UpdateReviewInput } from '@/features/user-review/type';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { SearchCareUnitForReview } from '@/features/user-review/ui/SearchCareUnitForReview';
import { Card, CardContent } from '@/components/ui/card';

export default function EditReviewPage() {
  const { id } = useParams(); // reviewId
  const reviewAtomData = useAtomValue(editReviewAtom) as ReviewData;
  const [departments, setDepartments] = useState<
    { id: string; name: string }[] | null
  >(null);

  if (reviewAtomData == null) {
    return <div>잘못된 접근입니다</div>;
  }

  const defaultValues = {
    content: reviewAtomData.content,
    thankMessage: reviewAtomData.thankMessage,
    departmentId: reviewAtomData.departmentId,
    rating: reviewAtomData.rating,
    isPublic: reviewAtomData.isPublic,
  };
  const careUnit = {
    name: reviewAtomData.careUnitName,
    address: '',
  };

  useEffect(() => {
    getCareUnitById(reviewAtomData.careUnitId as string).then((unit) => {
      setDepartments(unit.departments); // [{ id, name }]
    });
  }, [reviewAtomData]);

  if (!defaultValues || !careUnit || !departments || !id || !reviewAtomData)
    return <div>잘못된 접근입니다</div>;

  const handleSubmit = async (data: UpdateReviewInput) => {
    try {
      await updateReview(id as string, data);
      location.href = ROUTES.USER.REVIEWS;
      toast.success('적용 완료!');
    } catch {
      toast.warning('실패!');
    }
  };
  return (
    <main className="min-h-screen flex flex-col items-center !px-4 !py-10">
      <div className="w-full max-w-xl !space-y-10">
        <Card>
          <CardContent className="!space-y-6">
            {/* 제목 */}
            <div className="text-center !space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                리뷰 작성하기
              </h1>
              <p className="text-muted-foreground text-sm">
                방문하신 병원에 대한 솔직한 후기를 남겨주세요.
              </p>
            </div>

            <ReviewForm
              defaultValues={defaultValues}
              onSubmit={handleSubmit}
              careUnit={careUnit}
              departments={departments}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
