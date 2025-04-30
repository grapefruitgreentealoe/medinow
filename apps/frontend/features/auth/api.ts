import axiosInstance from '@/lib/axios';
import { AdminSignupData, LoginData, SignupData } from './type';

export const login = async (data: LoginData) => {
  const res = await axiosInstance.post('/auth/login', data);
  return res.data;
};

export const logout = async () => {
  const res = await axiosInstance.post('/auth/logout');
  return res.data;
};

export const signup = async (data: SignupData) => {
  const res = await axiosInstance.post('/auth/signup', data);
  return res.data;
};

export const adminSignup = async (data: AdminSignupData) => {
  const res = await axiosInstance.post('/auth/admin-signup', data);
  return res.data;
};

export const checkEmail = async (email: string) => {
  const res = await axiosInstance.get(`/users/check-email?email=${email}`);
  return res.data.idDuplicate;
};

