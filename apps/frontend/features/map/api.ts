import axiosInstance from '@/lib/axios';
import { CareUnit } from '../../shared/type';

interface LocationByCategoryData {
  lat: number;
  lng: number;
  level: number;
  category?: 'emergency' | 'hospital' | 'pharmacy';
  page: number;
  limit: number;
  OpenStatus: boolean;
}

export const locationByCategory = async (
  data: LocationByCategoryData & { isLogin: boolean }
): Promise<CareUnit[]> => {
  const { lat, lng, level, category, page, limit, OpenStatus, isLogin } = data;
  const res = await axiosInstance.get(
    `/care-units/${isLogin ? 'location-by-category-login' : 'location-by-category'}?lat=${lat}&lng=${lng}&level=${level}${category ? `&category=${category}` : ''}&page=${page}&limit=${limit}&OpenStatus=${OpenStatus}`
  );
  return res.data.items;
};

export const toggleFavorite = async (careUnitId: string) => {
  const res = await axiosInstance.post('/favorites', {
    careUnitId,
  });
  return res.data as boolean; // true
};

export interface ChatRoom {
  id: string;
  target: CareUnit;
  createdAt: string;
  updatedAt: string;
}
