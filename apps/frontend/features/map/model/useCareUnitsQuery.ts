import { useInfiniteQuery } from '@tanstack/react-query';
import { locationByCategory } from '../api'; // 또는 locationByCategoryMock
import { useSetAtom } from 'jotai';
import { careUnitsQueryKeyAtom } from '../atoms/careUnitsQueryKeyAtom';
import { UseCareUnitsQueryResult } from '../type';

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
  const roundedLat = lat ? Math.floor(lat * 1000) / 1000 : null;
  const roundedLng = lng ? Math.floor(lng * 1000) / 1000 : null;

  const queryKey = [
    'careUnits',
    roundedLat,
    roundedLng,
    level,
    selectedCategory,
    OpenStatus,
  ];
  const setQueryKeyAtom = useSetAtom(careUnitsQueryKeyAtom);
  setQueryKeyAtom(queryKey); // useEffect 말고 함수 안에서 직접 실행

  const query = useInfiniteQuery({
    staleTime: 5000,
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      if (lat === null || lng === null || level === null)
        return { items: [], hasNext: false };

      const items = await locationByCategory({
        lat,
        lng,
        level,
        page: pageParam,
        limit: 10,
        OpenStatus,
        category:
          selectedCategory === '응급실'
            ? 'emergency'
            : selectedCategory === '병원'
              ? 'hospital'
              : selectedCategory === '약국'
                ? 'pharmacy'
                : undefined,
      });

      return {
        items,
        hasNext: items.length === 10,
        nextPage: undefined,
      };
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNext ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: lat !== null && lng !== null,
  });

  const flatItems = query.data?.pages.flatMap((p) => p.items) ?? [];

  return {
    data: flatItems,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    raw: query,
    queryKey, // 👈 이거 추가!
  };
}
