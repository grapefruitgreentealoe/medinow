import { CareUnit, CongestionLevel } from '../type';

export const congestionClassMap: Record<CongestionLevel, string> = {
  HIGH: 'bg-red-100 text-red-600',
  MEDIUM: 'bg-yellow-100 text-yellow-600',
  LOW: 'bg-green-100 text-green-600',
};

export const CATEGORY_LABEL: Record<CareUnit['category'], string> = {
  emergency: '응급실',
  pharmacy: '약국',
  hospital: '의료기관',
};
