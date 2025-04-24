'use client';

import { Button } from '@/components/ui/button';
import { useCareUnitReviews } from './model/useCareUnitReviews';

interface Props {
  careUnitId: string;
}

export function ReviewList({ careUnitId }: Props) {
  const { data, fetchNextPage, isLoading, hasNextPage } =
    useCareUnitReviews(careUnitId);

  const reviews = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <section className="pt-4 border-t">
      <h2 className="text-lg font-semibold mb-2">방문자 리뷰</h2>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">리뷰 불러오는 중...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">작성된 리뷰가 없습니다.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.reviewId} className="p-3 border rounded-lg">
              <p className="text-sm text-foreground whitespace-pre-line">
                {review.content}
              </p>
              {review.thankMessage && (
                <p className="mt-1 text-xs text-muted-foreground">
                  🙏 {review.thankMessage}
                </p>
              )}
              <p className="mt-2 text-sm">⭐ {review.rating}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt ?? '').toLocaleDateString('ko-KR')}
              </p>
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
