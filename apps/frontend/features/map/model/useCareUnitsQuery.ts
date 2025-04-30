import { useInfiniteQuery } from '@tanstack/react-query';
import { locationByCategory } from '../api'; // 또는 locationByCategoryMock
import { useSetAtom } from 'jotai';
import { careUnitsQueryKeyAtom } from '../atoms/careUnitsQueryKeyAtom';
import { UseCareUnitsQueryResult } from '../type';
import { useEffect } from 'react';

interface UseCareUnitsQueryProps {
  lat: number | null;
  lng: number | null;
  level: number | null;
  selectedCategory: string;
  OpenStatus: boolean;
}

export function useCareUnitsQuery({
  lat,
  lng,
  level,
  selectedCategory,
  OpenStatus,
}: UseCareUnitsQueryProps): UseCareUnitsQueryResult & { queryKey: any[] } {
  const queryKey = ['careUnits', lat, lng, selectedCategory, OpenStatus];
  const setQueryKeyAtom = useSetAtom(careUnitsQueryKeyAtom);

  // queryKeyAtom을 업데이트하는 useEffect
  useEffect(() => {
    setQueryKeyAtom(queryKey);
  }, [setQueryKeyAtom, queryKey]);

  // lat, lng, level이 모두 null이 아닐 때만 쿼리 활성화
  const shouldFetch = lat !== null && lng !== null && level !== null;

  const query = useInfiniteQuery({
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 10,
    staleTime: 1000 * 60 * 5,
    enabled: shouldFetch,
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      const items = await locationByCategory({
        lat: lat!,
        lng: lng!,
        level: level!,
        page: pageParam,
        limit: 10,
        OpenStatus,
        category:
          selectedCategory === '응급실'
            ? 'emergency'
            : selectedCategory === '의료기관'
              ? 'hospital'
              : selectedCategory === '약국'
                ? 'pharmacy'
                : undefined,
      });
      return {
        items,
        hasNext: items.length === 10,
      };
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNext ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const flatItems = query.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    data: flatItems,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    raw: query,
    queryKey,
  };
}
