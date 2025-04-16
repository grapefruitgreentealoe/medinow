import axiosInstance from '@/lib/axios';

interface LoginData {
  email: string;
  password: string;
}

export const login = async (data: LoginData) => {
  const res = await axiosInstance.post('/auth/login', data);
  return res.data;
};

export const logout = async () => {
  const res = await axiosInstance.post('/auth/logout');
  return res.data;
};
