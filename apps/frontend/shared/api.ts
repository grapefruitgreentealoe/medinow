import axiosInstance from '@/lib/axios';
export const checkCareUnitExist = async (data: {
  name: string;
  address: string;
  category: string;
}) => {
  const query = new URLSearchParams({
    name: data.name,
    address: data.address,
    category: data.category,
  });

  const res = await axiosInstance.get(`/care-units/exist?${query.toString()}`);
  return res.data as boolean;
};
