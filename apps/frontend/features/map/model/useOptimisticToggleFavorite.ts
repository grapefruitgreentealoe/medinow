// /features/map/model/useOptimisticToggleFavorite.ts

import { useQueryClient } from '@tanstack/react-query';
import { useSetAtom, useAtomValue } from 'jotai';
import { selectedCareUnitAtom } from '@/features/map/atoms/selectedCareUnitAtom';
import { toggleFavorite } from '../api';

export function useOptimisticToggleFavorite(queryKey: any[]) {
  const queryClient = useQueryClient();
  const setSelected = useSetAtom(selectedCareUnitAtom);
  const selected = useAtomValue(selectedCareUnitAtom);

  return {
    toggleFavorite: (unitId: string, currentFavorite: boolean) => {
      // 1. optimistic update → atom 변경
      if (selected?.id === unitId) {
        setSelected({ ...selected, isFavorite: !currentFavorite });
      }

      // 2. 리스트 쿼리 캐시도 업데이트
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: any) =>
              item.id === unitId
                ? { ...item, isFavorite: !currentFavorite }
                : item
            ),
          })),
        };
      });

      // 3. 서버 요청
      toggleFavorite(unitId).catch(() => {
        // 4. 롤백: atom
        if (selected?.id === unitId) {
          setSelected({ ...selected, isFavorite: currentFavorite });
        }

        // 5. 롤백: 리스트 쿼리 캐시
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              items: page.items.map((item: any) =>
                item.id === unitId
                  ? { ...item, isFavorite: currentFavorite }
                  : item
              ),
            })),
          };
        });
      });
    },
  };
}
