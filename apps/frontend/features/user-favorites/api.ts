import axiosInstance from '@/lib/axios';

export async function getFavoriteList({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) {
  const res = await axiosInstance.get(`/favorites`, {
    params: { page, limit },
  });
  return res.data;
}
