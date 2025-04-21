import axiosInstance from '@/lib/axios';
import { CareUnit } from './type';
import { generateMockCareUnits } from '@/lib/mockCareUnits';

interface LocationByCategoryData {
  lat: number;
  lng: number;
  level: number;
  category?: 'emergency' | 'hospital' | 'pharmacy';
  page: number;
  limit: number;
}

export const locationByCategory = async (
  data: LocationByCategoryData
): Promise<CareUnit[]> => {
  const { lat, lng, level, category, page, limit } = data;
  const res = await axiosInstance.get(
    `/care-units/location-by-category?lat=${lat}&lng=${lng}&level=${level}${category ? `&category=${category}` : ''}&page=${page}&limit=${limit}`
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
