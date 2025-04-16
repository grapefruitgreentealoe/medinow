import axiosInstance from '@/lib/axios';

export const login = async (data) => {
  const res = await axiosInstance.post('/auth/login', data);
  return res.data;
};

export const logout = async () => {
  const res = await axiosInstance.post('/auth/logout', data);
  return res.data;
};
