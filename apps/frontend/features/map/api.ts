import axiosInstance from '@/lib/axios';
import { CareUnit } from './type';

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
  data: LocationByCategoryData
): Promise<CareUnit[]> => {
  const { lat, lng, level, category, page, limit, OpenStatus } = data;
  const isLogin = window.__INITIAL_IS_LOGGED_IN__;
  const res = await axiosInstance.get(
    `/care-units/${isLogin ? 'location-by-category-login' : 'location-by-category'}?lat=${lat}&lng=${lng}&level=${level}${category ? `&category=${category}` : ''}&page=${page}&limit=${limit}&OpenStatus=${OpenStatus}`
  );
  return res.data.items;
};

export const toggleFavorite = async (careUnitId: string) => {
  console.log(careUnitId);
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

// // ✨ mock pagination 함수
// export async function locationByCategoryMock(
//   data: LocationByCategoryData
// ): Promise<CareUnit[]> {
//   await new Promise((res) => setTimeout(res, 300)); // 네트워크 딜레이

//   const start = (data.page - 1) * data.limit;
//   const all = generateMockCareUnits(start, data.limit, data.lat, data.lng);

//   if (data.category) {
//     return all.filter((unit) => unit.category === data.category);
//   }
//   console.log('isFetching');
//   return all;
// }
