import { CareUnit } from '../type';
import { QueryClient } from '@tanstack/react-query';

export function updateCareUnitFavorite(
  queryClient: QueryClient,
  queryKey: any[],
  unitId: string,
  nextFavorite: boolean
) {
  queryClient.setQueryData(queryKey, (old: any) => {
    if (!old) return old;

    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        items: page.items.map((item: CareUnit) =>
          item.id === unitId ? { ...item, isFavorite: nextFavorite } : item
        ),
      })),
    };
  });

  queryClient.setQueryData(['selectedCareUnit'], (prev: CareUnit | null) =>
    prev?.id === unitId ? { ...prev, isFavorite: nextFavorite } : prev
  );
}
