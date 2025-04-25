import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '../api';

export function useFavoritesQuery(page: number, limit = 10) {
  return useQuery({
    queryKey: ['favorites', page],
    queryFn: () => getFavorites({ page, limit }),
    staleTime: 1000 * 10,
  });
}
