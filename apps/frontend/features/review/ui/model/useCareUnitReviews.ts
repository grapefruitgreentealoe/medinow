import { getReviewsByCareUnit } from '@/features/user-review/api';
import { PaginatedReviewResponse } from '@/features/user-review/type';
import { useInfiniteQuery } from '@tanstack/react-query';

export function useCareUnitReviews(careUnitId: string) {
  return useInfiniteQuery<PaginatedReviewResponse>({
    queryKey: ['reviews', careUnitId],
    queryFn: ({ pageParam = 1 }) =>
      getReviewsByCareUnit(careUnitId, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? lastPage.meta.currentPage + 1 : undefined,
    enabled: !!careUnitId,
  });
}
