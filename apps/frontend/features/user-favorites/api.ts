import axiosInstance from '@/lib/axios';

export const getFavoriteList = async (): Promise<any[]> => {
  const res = await axiosInstance.get('/favorites');
  return res.data;
};
