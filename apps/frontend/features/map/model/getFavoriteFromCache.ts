import { QueryClient } from '@tanstack/react-query';

export function getFavoriteFromCache(
  queryClient: QueryClient,
  queryKey: any[],
  unitId: string
): boolean {
  const data: any = queryClient.getQueryData(queryKey);
  if (!data) return false;

  for (const page of data.pages) {
    for (const item of page.items) {
      if (item.id === unitId) return item.isFavorite;
    }
  }
  return false;
}
