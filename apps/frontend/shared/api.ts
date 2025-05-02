import axiosInstance from '@/lib/axios';
import { CareUnit, CareUnitWithDepartments } from './type';

export const checkCareUnitExist = async (data: {
  name: string;
  address: string;
  category: string;
}): Promise<CareUnitWithDepartments> => {
  const query = new URLSearchParams({
    name: data.name,
    address: data.address,
    category: data.category,
  });

  const res = await axiosInstance.get(`/care-units/exist?${query.toString()}`);
  return res.data;
};

export const getCareUnitById = async (id: string): Promise<CareUnit> => {
  const res = await axiosInstance.get(`/care-units/${id}`);
  return res.data;
};
