import { useInfiniteQuery } from '@tanstack/react-query';
import { getReviews } from '../api';
import { PaginatedReviewResponse } from '../type';

export function useInfiniteReviewsQuery(limit = 5) {
  return useInfiniteQuery<PaginatedReviewResponse>({
    queryKey: ['reviews'],
    queryFn: ({ pageParam = 1 }) =>
      getReviews({ pageParam: pageParam as number, limit }),
    initialPageParam: 1, // ✅ 이게 필수야
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined;
    },
    staleTime: 60 * 1000,
  });
}
