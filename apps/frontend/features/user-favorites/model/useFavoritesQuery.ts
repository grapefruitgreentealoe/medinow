// /features/user-favorites/model/useFavoritesQuery.ts
import { useQuery } from '@tanstack/react-query';
import { getFavoriteList } from '../api';

export function useFavoritesQuery(page: number, limit = 10) {
  return useQuery({
    queryKey: ['favorites', page],
    queryFn: () => getFavoriteList({ page, limit }), 
    staleTime: 1000 * 10,
  });
}
