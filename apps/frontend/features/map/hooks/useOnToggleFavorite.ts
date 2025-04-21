// hooks/useToggleFavorite.ts
import { useMutation } from '@tanstack/react-query';
import { toggleFavorite } from '@/features/map/api';

export const useToggleFavorite = () => {
  return useMutation({
    mutationFn: async ({ unitId }: { unitId: string; next: boolean }) => {
      // 실제 API 호출 (토글 방식)
      return toggleFavorite(unitId);
    },
  });
};
