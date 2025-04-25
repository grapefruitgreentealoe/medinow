'use client';

import { useAtomValue } from 'jotai';
import { editReviewAtom } from '@/features/user-review/atoms/editReviewAtom';
import { useRouter } from 'next/navigation';
import { ReviewForm } from '@/features/user-review/ui/ReviewForm';
import { updateReview } from '@/features/user-review/api';
import { ROUTES } from '@/shared/constants/routes';

interface EditPageProps {
  params: { id: string };
}

export default function EditReviewPage({ params }: EditPageProps) {
  const defaultValues = useAtomValue(editReviewAtom);
  console.log(defaultValues);
  const router = useRouter();

  if (!defaultValues) return <div>잘못된 접근입니다. 목록으로 돌아가세요.</div>;

  const handleUpdate = async (data: typeof defaultValues) => {
    updateReview(params.id, data);
    alert('리뷰가 수정되었습니다!');
    router.push(ROUTES.USER.REVIEWS);
  };

  return <ReviewForm defaultValues={defaultValues} onSubmit={handleUpdate} />;
}
