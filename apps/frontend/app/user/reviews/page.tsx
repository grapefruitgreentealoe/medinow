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
    router.push(ROUTES.USER.EDIT_REVIEW(confirmEditId ?? ''));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {reviews.map((review) => (
          <ReviewItem
            key={review.reviewId}
            review={review}
            onEdit={() => setConfirmEditId(review.reviewId)}
            onDelete={() => setConfirmDeleteId(review.reviewId)}
            onDetail={() => setDetailReview(review)}
          />
        ))}
      </div>

      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => p - 1)}
              />
            </PaginationItem>
          )}

          {Array.from({ length: totalPages }, (_, i) => (
            <PaginationItem key={i}>
              <PaginationLink
                isActive={currentPage === i + 1}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext onClick={() => setCurrentPage((p) => p + 1)} />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>

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
        <div>
          <h3 className="text-lg font-bold mb-2">
            {detailReview?.careUnitName}
          </h3>
          <p className="text-sm text-muted-foreground mb-1">
            {detailReview?.departmentName}
          </p>
          <p className="text-sm text-muted-foreground mb-1">
            ⭐ {detailReview?.rating}
          </p>
          <p className="mt-4 whitespace-pre-line">{detailReview?.content}</p>
        </div>
      </ContentDialog>

      {isFetching && (
        <p className="text-center text-muted-foreground">불러오는 중...</p>
      )}
    </div>
  );
}
