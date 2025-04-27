'use client';

import { Button } from '@/components/ui/button';
import { useCareUnitReviews } from './model/useCareUnitReviews';
import { ReviewContent } from './ReviewContent';
import { ReviewBody } from './ReviewBody';

interface Props {
  careUnitId: string;
}

export function ReviewList({ careUnitId }: Props) {
  const { data, fetchNextPage, isLoading, hasNextPage } =
    useCareUnitReviews(careUnitId);

  const reviews = data?.pages?.flatMap((page) => page.reviews ?? []) ?? [];

  if (!reviews) return null;

  return (
    <section className="pt-4">
      {isLoading ? (
        <p className="text-sm text-muted-foreground">리뷰 불러오는 중...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">작성된 리뷰가 없습니다.</p>
      ) : (
        <ul className="!space-y-4 border-b border-slate-300 !py-4">
          {reviews.map((review) => (
            <li key={review.reviewId}>
              <ReviewBody
                createdAt={review.createdAt}
                content={review.content}
                thankMessage={review.thankMessage}
                rating={review.rating}
              />
            </li>
          ))}
        </ul>
      )}

      {hasNextPage && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={() => fetchNextPage()}
        >
          더보기
        </Button>
      )}
    </section>
  );
}
