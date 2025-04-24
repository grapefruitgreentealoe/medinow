import { useInfiniteQuery } from '@tanstack/react-query';
import { getFavoriteList } from '../api'; // 너의 API에 따라 경로 수정
import { CareUnit } from '@/shared/type';

export function useFavoritesQuery(): {
  data: CareUnit[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
} {
  const query = useInfiniteQuery({
    queryKey: ['favorites'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getFavoriteList({ page: pageParam, limit: 10 });
      return {
        items: response.careUnits ?? [],
        hasNext: response.length === 10,
      };
    },
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasNext ? pages.length + 1 : undefined,
    initialPageParam: 1,
  });

  return {
    data: query.data?.pages.flatMap((p) => p.items) ?? [],
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isLoading: query.isLoading,
  };
}
