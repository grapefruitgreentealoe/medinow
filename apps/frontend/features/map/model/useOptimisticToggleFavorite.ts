import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleFavorite } from '../api';
import { CareUnit } from '../../../shared/type';
import { useAtomValue, useSetAtom } from 'jotai';
import { selectedCareUnitAtom } from '../atoms/selectedCareUnitAtom';
import { toast } from 'sonner';

export function useOptimisticToggleFavorite(queryKey: any[]) {
  const queryClient = useQueryClient();
  const selected = useAtomValue(selectedCareUnitAtom);
  const setSelected = useSetAtom(selectedCareUnitAtom);

  return useMutation({
    mutationFn: async ({ unitId }: { unitId: string }) => {
      return toggleFavorite(unitId);
    },

    // 1. Optimistic Update
    onMutate: async ({ unitId }: { unitId: string }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey) as
        | { pages: { items: CareUnit[] }[] }
        | undefined;

      const cached = previousData?.pages
        ?.flatMap((p: any) => p.items)
        .find((i: CareUnit) => i.id === unitId);
      const next = !cached?.isFavorite;

      // update selectedCareUnit atom
      if (selected?.id === unitId) {
        setSelected({ ...selected, isFavorite: next });
      }

      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((item: CareUnit) =>
              item.id === unitId ? { ...item, isFavorite: next } : item
            ),
          })),
        };
      });

      //context
      return { previousData, unitId, currentFavorite: !next };
    },

    // 2. Rollback on error
    onError: (_err, _variables, context) => {
      if (!context) return;

      // rollback selectedCareUnit
      if (selected?.id === context.unitId) {
        setSelected({ ...selected, isFavorite: context.currentFavorite });
      }

      // rollback query cache
      queryClient.setQueryData(queryKey, context.previousData);
      // 경고 스타일 + 버튼
      toast.warning('적용 실패', {
        description: '네트워크 연결 불가',
      });
    },
    onSuccess: (a, b, context) => {
      toast.success('저장 완료!', {
        description: !context.currentFavorite
          ? '즐겨찾기 완료!'
          : '즐겨찾기 해제',
      });
    },

    // 3. (Optional) Invalidate on settled if needed
    onSettled: () => {
      // do nothing – we assume optimistic update is final
    },
  });
}
