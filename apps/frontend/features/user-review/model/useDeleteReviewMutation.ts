import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReview } from '../api';

export function useDeleteReviewMutation(page: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,

    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey: ['reviews', page] });

      const previous = queryClient.getQueryData(['reviews', page]);

      queryClient.setQueryData(['reviews', page], (old: any) => {
        if (!old || !old.reviews) return old;

        return {
          ...old,
          reviews: old.reviews.filter((r: any) => r.reviewId !== reviewId),
        };
      });

      return { previous };
    },

    onError: (_err, _id, context) => {
      console.log(_err);
      if (context?.previous) {
        queryClient.setQueryData(['reviews', page], context.previous);
      }
    },

    onSettled: () => {
      // queryClient.invalidateQueries({ queryKey: ['reviews', page] });
    },
  });
}
