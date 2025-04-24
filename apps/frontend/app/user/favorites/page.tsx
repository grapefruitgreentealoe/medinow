'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CareUnit } from '@/features/map/type';
import { CareUnitCard } from '@/features/map/ui/CareUnitCard';
import { selectedCareUnitAtom } from '@/features/map/atoms/selectedCareUnitAtom';
import { useAtomValue, useSetAtom } from 'jotai';
import axiosInstance from '@/lib/axios';
import { getFavoriteList } from '@/features/user-favorites/api';
import { RichCareUnitCard } from '@/features/user-favorites/ui/FavoriteUnitCard';
import { HospitalDetailDrawer } from '@/features/user-favorites/ui/HospitalDetailDrawer';

export default function FavoritesPage() {
  const selected = useAtomValue(selectedCareUnitAtom); // ✅ 읽기만
  const setSelected = useSetAtom(selectedCareUnitAtom);

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavoriteList,
  });

  if (isLoading) return <p>불러오는 중...</p>;
  if (!data || data.length === 0) return <p>즐겨찾기된 병원이 없습니다.</p>;

  const handleSelect = (unit: CareUnit) => {
    setSelected(unit);
    // 추후 병원 상세 Sheet 열기 가능
  };

  return (
    <section className="h-[100vh] overfl">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">즐겨찾기 병원</h1>

        <div className="grid gap-4">
          {data.map((unit, i) => {
            const { name, address, favorite } = unit;
            return (
              <RichCareUnitCard
                key={i}
                unit={{
                  id: String(i),
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  deletedAt: null,
                  name,
                  address,
                  tel: '',
                  category: 'hospital',
                  hpId: '',
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
                  lat: 0,
                  lng: 0,
                  isBadged: false,
                  nowOpen: true,
                  kakaoUrl: null,
                  isChatAvailable: true,
                  isFavorite: favorite,
                  congestion: {
                    hvec: 0,
                    congestionLevel: 'LOW',
                    updatedAt: new Date().toISOString(),
                    hpid: '',
                    name: '',
                  },
                  departments: ['이비인후과', '안과'],
                  rating: 4.5,
                  reviewCount: 12,
                }}
                onDetail={() => setSelected(unit)}
                onToggleFavorite={(id) => console.log('즐찾 토글:', id)}
              />
            );
          })}
        </div>
      </div>

      {selected && <HospitalDetailDrawer />}
    </section>
  );
}
