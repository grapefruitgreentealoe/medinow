import { toggleFavorite } from '@/features/map/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useFavoriteToggle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ unitId }: { unitId: string }) => {
      return toggleFavorite(unitId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}
