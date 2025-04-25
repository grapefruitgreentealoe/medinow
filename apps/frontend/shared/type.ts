import { useInfiniteQuery } from '@tanstack/react-query';

export interface Department {
  id: string;
  name: string;
}

export interface CareUnitWithDepartments {
  id: string;
  name: string;
  address: string;
  departments: Department[];
}

export interface Congestion {
  hvec: number;
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  updatedAt: string;
  hpid: string;
  name: string;
}

export interface CareUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  name: string;
  address: string;
  tel: string;
  category: 'emergency' | 'hospital' | 'pharmacy' | string;
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

  isBadged: boolean;
  nowOpen: boolean;
  kakaoUrl: string | null;

  isChatAvailable: boolean;
  isFavorite: boolean;

  departments: Department[];
  congestion: Congestion;

  averageRating: number;
  reviewCount: number;
}

export type CareUnitCategory = 'hospital' | 'pharmacy' | 'emergency';

export type CongestionLevel = 'HIGH' | 'MEDIUM' | 'LOW';
