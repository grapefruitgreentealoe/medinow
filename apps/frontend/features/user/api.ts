import axiosInstance from '@/shared/lib/axios';

export const user = async () => {
  const res = await axiosInstance.get(`/users`);
  console.log(res);
  return res;
};
