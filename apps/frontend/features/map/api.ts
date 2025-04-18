import axiosInstance from '@/lib/axios';

interface LocationByCategoryData {
  lat: number;
  lng: number;
  level: number;
  category?: 'emergency' | 'hospital' | 'pharmacy';
}
export type CareUnitCategory = 'hospital' | 'pharmacy' | 'emergency';

export interface CareUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  name: string;
  address: string;
  tel: string;
  category: CareUnitCategory;
  hpId: string;

  mondayOpen: number | null;
  mondayClose: number | null;
  tuesdayOpen: number | null;
  tuesdayClose: number | null;
  wednesdayOpen: number | null;
  wednesdayClose: number | null;
  thursdayOpen: number | null;
  thursdayClose: number | null;
  fridayOpen: number | null;
  fridayClose: number | null;
  saturdayOpen: number | null;
  saturdayClose: number | null;
  sundayOpen: number | null;
  sundayClose: number | null;
  holidayOpen: number | null;
  holidayClose: number | null;

  lat: number;
  lng: number;

  is_badged: boolean;
  now_open: boolean;
  kakao_url: string | null;
}

export const locationByCategory = async (
  data: LocationByCategoryData
): Promise<CareUnit[]> => {
  const { lat, lng, level, category } = data;
  const res = await axiosInstance.get(
    `/care-units/location-by-category?lat=${lat}&lng=${lng}&level=${level}&category=${category}`
  );
  return res.data;
};
