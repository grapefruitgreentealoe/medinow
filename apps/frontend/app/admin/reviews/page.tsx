'use client';

import { useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { usePaginatedReviewsQuery } from '@/features/user-review/model/useReviewsQuery';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';
import { editReviewAtom } from '@/features/user-review/atoms/editReviewAtom';
import { useSetAtom } from 'jotai';
import { useDeleteReviewMutation } from '@/features/user-review/model/useDeleteReviewMutation';
import { toast } from 'sonner';
import { ReviewData } from '@/features/user-review/type';
import { ReviewList } from '@/features/review/ui/ReviewList';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ContentDialog } from '@/shared/ui/ContentDialog';
import { ReviewItem } from '@/features/user-review/ui/ReviewItem';
import { SimplePagination } from '@/shared/ui/SimplePagination';
import { ReviewBody } from '@/features/review/ui/ReviewBody';

export default function ReviewPaginationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEditId, setConfirmEditId] = useState<string | null>(null);
  const [detailReview, setDetailReview] = useState<ReviewData | null>(null);

  const { data, isFetching } = usePaginatedReviewsQuery(currentPage);
  const { mutate: deleteReviewMutate } = useDeleteReviewMutation(currentPage);
  const router = useRouter();
  const setEditReview = useSetAtom(editReviewAtom);

  const reviews = data?.reviews ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  const handleDeleteReview = () => {
    deleteReviewMutate(confirmDeleteId!, {
      onSuccess: () => {
        toast.success('삭제 완료!');
        setConfirmDeleteId(null);
      },
      onError: () => {
        toast.warning('에러 발생');
      },
    });
  };

  const handleEditReview = () => {
    const review = reviews.find((r) => r.reviewId === confirmEditId);
    if (review) {
      setEditReview(review);
    }
    router.push(ROUTES.USER.EDIT_REVIEW(confirmEditId!));
  };

  if (!reviews) return null;

  return (
    <div className="!space-y-6 !mx-[20px] !mt-[30px]">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reviews.map((review) => (
          <ReviewItem
            isAdmin={true}
            key={review.reviewId}
            review={review}
            onEdit={() => setConfirmEditId(review.reviewId)}
            onDelete={() => setConfirmDeleteId(review.reviewId)}
            onDetail={() => setDetailReview(review)}
          />
        ))}
      </div>

      {/* 페이지네이션 */}
      <SimplePagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      <ConfirmDialog
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteReview}
        title="리뷰 삭제"
        description="정말 이 리뷰를 삭제하시겠습니까?"
        confirmText="삭제하기"
        cancelText="취소"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        open={!!confirmEditId}
        onClose={() => setConfirmEditId(null)}
        onConfirm={handleEditReview}
        title="리뷰 수정"
        description="수정 페이지로 이동하시겠습니까?"
        confirmText="이동하기"
        cancelText="취소"
        confirmVariant="default"
      />

      <ContentDialog
        open={!!detailReview}
        onClose={() => setDetailReview(null)}
        title="리뷰 상세보기"
        ctaText="확인"
        onCtaClick={() => setDetailReview(null)}
      >
        {detailReview && (
          <ReviewBody
            nickname={detailReview.nickname}
            rating={detailReview.rating}
            content={detailReview.content}
            createdAt={detailReview.createdAt}
            thankMessage={detailReview.thankMessage}
          />
        )}
      </ContentDialog>

      {isFetching && (
        <p className="text-center text-muted-foreground">불러오는 중...</p>
      )}
    </div>
  );
}
