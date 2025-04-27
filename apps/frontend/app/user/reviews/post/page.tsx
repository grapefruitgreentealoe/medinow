'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import {
  selectedCareUnitIdAtom,
  selectedCareUnitAtom,
  selectedDepartmentsAtom,
} from '@/features/user-review/atoms/reviewFormAtom';
import { getCareUnitById, submitReview } from '@/features/user-review/api';
import { ReviewForm } from '@/features/user-review/ui/ReviewForm';
import { SearchCareUnitForReview } from '@/features/user-review/ui/SearchCareUnitForReview';

import { ROUTES } from '@/shared/constants/routes';
import { FormSchema } from '@/features/user-review/schema/reviewSchema';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

export default function WriteReviewPage() {
  const searchParams = useSearchParams();
  const setId = useSetAtom(selectedCareUnitIdAtom);
  const setCareUnit = useSetAtom(selectedCareUnitAtom);
  const careUnit = useAtomValue(selectedCareUnitAtom);
  const setDepartments = useSetAtom(selectedDepartmentsAtom);

  const careUnitIdFromUrl = searchParams.get('careUnitId');
  const router = useRouter();

  const setInitialData = (id: string) => {
    try {
      getCareUnitById(id).then((res) => {
        setCareUnit(res);
        setDepartments(res.departments || []);
      });
    } catch {
      toast.warning('병원 정보를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    if (careUnitIdFromUrl) {
      setId(careUnitIdFromUrl);
      setInitialData(careUnitIdFromUrl);
    }
  }, [careUnitIdFromUrl]);

  const onSubmit = async (values: FormSchema) => {
    if (!careUnit) return;
    try {
      await submitReview({
        careUnitId: careUnit.id,
        departmentId: values.departmentId,
        content: values.content,
        thankMessage: values.thankMessage,
        rating: values.rating,
        isPublic: true,
      });
      router.push(ROUTES.USER.REVIEWS);
      toast.success('리뷰가 등록되었습니다!');
    } catch {
      toast.warning('리뷰 등록에 실패했습니다.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center !px-4 !py-10">
      <div className="w-full max-w-xl !space-y-10">
        <Card>
          <CardContent className="!space-y-6">
            <div className="w-full max-w-xl !space-y-10">
              {/* 제목 */}
              <div className="text-center !space-y-2">
                <h1 className="text-2xl font-bold tracking-tight !text-primary">
                  리뷰 작성하기
                </h1>
                <p className="text-muted-foreground text-sm">
                  방문하신 병원에 대한 솔직한 후기를 남겨주세요.
                </p>
              </div>

              {/* 병원 검색 or 리뷰 폼 */}
              {!careUnit ? (
                <SearchCareUnitForReview />
              ) : (
                <ReviewForm onSubmit={onSubmit} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
