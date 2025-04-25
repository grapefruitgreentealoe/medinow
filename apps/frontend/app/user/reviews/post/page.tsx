'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSetAtom, useAtomValue, createStore, Provider } from 'jotai';
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
    } catch {}
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
      toast.warning('문제발생');
    }
  };

  return (
    <main className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">리뷰 작성</h1>

      {!careUnit && <SearchCareUnitForReview />}
      {careUnit && <ReviewForm onSubmit={onSubmit} />}
    </main>
  );
}
