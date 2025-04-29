'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { updateReview } from '@/features/user-review/api';
import { getCareUnitById } from '@/shared/api';
import { ReviewForm } from '@/features/user-review/ui/ReviewForm';
import { editReviewAtom } from '@/features/user-review/atoms/editReviewAtom';
import { useAtomValue } from 'jotai';
import { ReviewData, UpdateReviewInput } from '@/features/user-review/type';
import { toast } from 'sonner';
import { ROUTES } from '@/shared/constants/routes';
import { Card, CardContent } from '@/components/ui/card';

export default function EditReviewPage() {
  const { id } = useParams(); // reviewId
  const reviewAtomData = useAtomValue(editReviewAtom) as ReviewData;
  const [departments, setDepartments] = useState<
    { id: string; name: string }[] | null
  >(null);

  useEffect(() => {
    getCareUnitById(reviewAtomData?.careUnitId as string).then((unit) => {
      setDepartments(unit.departments); // [{ id, name }]
    });
  }, [reviewAtomData]);

  const handleSubmit = async (data: UpdateReviewInput) => {
    try {
      await updateReview(id as string, data);
      location.href = ROUTES.USER.REVIEWS;
      toast.success('적용 완료!');
    } catch {
      toast.warning('실패!');
    }
  };

  if (!departments || !id || !reviewAtomData) {
    return null;
  }
  const careUnit = {
    name: reviewAtomData.careUnitName,
    address: '',
  };
  const defaultValues = {
    content: reviewAtomData.content,
    thankMessage: reviewAtomData.thankMessage,
    departmentId: reviewAtomData.departmentId,
    rating: reviewAtomData.rating,
    isPublic: reviewAtomData.isPublic,
  };

  return (
    <main className="min-h-screen flex flex-col items-center !px-4 !py-10">
      <div className="w-full max-w-xl !space-y-10">
        <Card>
          <CardContent className="!space-y-6">
            {/* 제목 */}
            <div className="text-center !space-y-2">
              <h1 className="text-2xl font-bold tracking-tight !text-primary">
                리뷰 작성하기
              </h1>
              <p className="text-muted-foreground text-sm">
                방문하신 병원에 대한 솔직한 후기를 남겨주세요.
              </p>
            </div>

            <ReviewForm
              isEditing={true}
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
