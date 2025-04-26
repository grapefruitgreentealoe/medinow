import { toggleFavorite } from '@/features/map/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useFavoriteToggle(currentPage: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ unitId }: { unitId: string }) => {
      return toggleFavorite(unitId);
    },
    onMutate: async ({ unitId }) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', currentPage] });

      const previous = queryClient.getQueryData(['favorites', currentPage]);

      queryClient.setQueryData(['favorites', currentPage], (old: any) => {
        console.log(old);
        if (!old || !old.careUnits) return old;

        return {
          ...old,
          careUnits: old.careUnits.filter((r: any) => r.id !== unitId),
        };
      });

      return { previous };
    },

    onError: (_err, _id, context) => {
      console.log(_err);
      if (context?.previous) {
        queryClient.setQueryData(['favorites', currentPage], context.previous);
      }
    },

    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ['careUnits', page] });
    },
  });
}
