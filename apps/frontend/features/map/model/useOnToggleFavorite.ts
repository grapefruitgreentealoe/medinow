import { useMutation } from '@tanstack/react-query';
import { toggleFavorite } from '@/features/map/api';

export const useToggleFavorite = () => {
  return useMutation({
    mutationFn: async ({ unitId }: { unitId: string; next: boolean }) => {
      return toggleFavorite(unitId);
    },
  });
};
