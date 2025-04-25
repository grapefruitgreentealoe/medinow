import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReview } from '../api';

export function useDeleteReviewMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,

    onMutate: async (reviewId) => {
      await queryClient.cancelQueries({ queryKey: ['reviews'] });

      const previous = queryClient.getQueryData(['reviews']);

      queryClient.setQueryData(['reviews'], (old: any) => {
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            reviews: page.reviews.filter((r: any) => r.reviewId !== reviewId),
          })),
        };
      });

      return { previous };
    },

    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['reviews'], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
