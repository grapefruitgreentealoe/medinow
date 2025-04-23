import { useQueryClient } from '@tanstack/react-query';
import { toggleFavorite } from '../api';
import { CareUnit } from '../type';
import { useAtom } from 'jotai';
import { selectedCareUnitAtom } from '../atoms/selectedCareUnitAtom';

export function useOptimisticToggleFavorite(queryKey: any[]) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useAtom(selectedCareUnitAtom);

  return {
    toggleFavorite: (unitId: string, currentFavorite: boolean) => {
      const next = !currentFavorite;

      // 1. 디테일 atom 수정
      if (selected?.id === unitId) {
        setSelected({ ...selected, isFavorite: next });
      }

      // 2. 리스트 캐시 수정
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        let found = false;

        const newPages = old.pages.map((page: any) => ({
          ...page,
          items: page.items.map((item: CareUnit) => {
            if (item.id === unitId) {
              found = true;
              return { ...item, isFavorite: next };
            }
            return item;
          }),
        }));

        if (!found) return old; // 바뀐 게 없으면 그대로

        return { ...old, pages: newPages };
      });

      // 3. 서버 요청
      toggleFavorite(unitId).catch(() => {
        // 4. 롤백: 디테일
        if (selected?.id === unitId) {
          setSelected({ ...selected, isFavorite: currentFavorite });
        }

        // 5. 롤백: 리스트 캐시
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old) return old;

          const rollbackPages = old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: CareUnit) =>
              item.id === unitId
                ? { ...item, isFavorite: currentFavorite }
                : item
            ),
          }));

          return { ...old, pages: rollbackPages };
        });
      });
    },
  };
}
