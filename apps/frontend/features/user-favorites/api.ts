// api/index.ts or api/favorites.ts

import axiosInstance from '@/lib/axios';
import { FavoritesResponse } from './type';

export const getFavorites = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<FavoritesResponse> => {
  const res = await axiosInstance.get('/favorites', {
    params: { page, limit },
  });
  return res.data;
};
