import { useQuery } from '@tanstack/react-query';
import { getReviews } from '../api';
import { PaginatedReviewResponse } from '../type';

export function usePaginatedReviewsQuery(page: number, limit = 5) {
  return useQuery<PaginatedReviewResponse>({
    queryKey: ['reviews', page],
    queryFn: () => getReviews({ pageParam: page, limit }),
    staleTime: 60 * 1000,
    placeholderData: (prevData) => prevData,
  });
}
