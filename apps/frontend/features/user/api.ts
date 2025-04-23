import axiosInstance from '@/lib/axios';

export const user = async () => {
  const res = await axiosInstance.get(`/users`);
  return res;
};
