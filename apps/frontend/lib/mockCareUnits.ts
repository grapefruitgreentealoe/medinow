import { CareUnit } from '@/features/type';

export const categories = ['emergency', 'hospital', 'pharmacy'] as const;

export function generateMockCareUnits(
  start: number,
  limit: number,
  baseLat: number,
  baseLng: number
): CareUnit[] {
  return Array.from({ length: limit }).map((_, i): CareUnit => {
    const index = start + i;
    const category = categories[index % categories.length];
    const lat = baseLat + (index % 10) * 0.005;
    const lng = baseLng + (index % 10) * 0.005;

    return {
      id: `id-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      name: `Care Unit ${index}`,
      address: `Address ${index}`,
      tel: `123-456-78${String(index).padStart(2, '0')}`,
      category,
      hpId: `hp-${index}`,

      mondayOpen: null,
      mondayClose: null,
      tuesdayOpen: null,
      tuesdayClose: null,
      wednesdayOpen: null,
      wednesdayClose: null,
      thursdayOpen: null,
      thursdayClose: null,
      fridayOpen: null,
      fridayClose: null,
      saturdayOpen: null,
      saturdayClose: null,
      sundayOpen: null,
      sundayClose: null,
      holidayOpen: null,
      holidayClose: null,

      lat,
      lng,

      isBadged: false,
      nowOpen: false,
      kakaoUrl: null,
      isChatAvailable: index % 2 === 0,
      isFavorite: index % 3 === 0,

      congestion: {
        hvec: index % 10,
        congestionLevel: ['LOW', 'MEDIUM', 'HIGH'][index % 3] as
          | 'LOW'
          | 'MEDIUM'
          | 'HIGH',
        updatedAt: new Date().toISOString(),
        hpid: `hp-${index}`,
        name: `Care Unit ${index}`,
      },
    };
  });
}
