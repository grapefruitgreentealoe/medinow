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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ReviewItem } from '@/features/user-review/ui/ReviewItem';
import { usePaginatedReviewsQuery } from '@/features/user-review/model/useReviewsQuery';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';
import { editReviewAtom } from '@/features/user-review/atoms/editReviewAtom';
import { useSetAtom } from 'jotai';
import { useDeleteReviewMutation } from '@/features/user-review/model/useDeleteReviewMutation';
import { toast } from 'sonner';

export default function ReviewPaginationPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmEditId, setConfirmEditId] = useState<string | null>(null);
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {reviews.map((review) => (
          <ReviewItem
            key={review.reviewId}
            review={review}
            onEdit={() => setConfirmEditId(review.reviewId)}
            onDelete={() => setConfirmDeleteId(review.reviewId)}
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

      <Dialog
        open={!!confirmDeleteId}
        onOpenChange={() => setConfirmDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <p className="text-lg font-semibold">리뷰 삭제</p>
          </DialogHeader>
          <p className="text-sm mt-2">정말 이 리뷰를 삭제하시겠습니까?</p>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button variant="destructive" onClick={handleDeleteReview}>
              삭제하기
            </Button>
            <Button variant="outline" onClick={() => setConfirmDeleteId(null)}>
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!confirmEditId}
        onOpenChange={() => setConfirmEditId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <p className="text-lg font-semibold">리뷰 수정</p>
          </DialogHeader>
          <p className="text-sm mt-2">수정 페이지로 이동하시겠어요?</p>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              onClick={() => {
                const review = reviews.find(
                  (r) => r.reviewId === confirmEditId
                );
                if (review) {
                  setEditReview(review);
                }
                router.push(ROUTES.USER.EDIT_REVIEW(confirmEditId ?? ''));
              }}
            >
              이동하기
            </Button>
            <Button variant="outline" onClick={() => setConfirmEditId(null)}>
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isFetching && (
        <p className="text-center text-muted-foreground">불러오는 중...</p>
      )}
    </div>
  );
}
