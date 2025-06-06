'use client';

import { useAtom } from 'jotai';
import {
  detailSheetOpenAtom,
  detailSheetPageAtom,
} from '@/features/map/atoms/detailSheetAtoms';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { CareUnitListPage } from './CareUnitListPage';
import CareUnitDetailPage from './CareUnitDetailPage';
import { useCareUnitsQuery } from '@/features/map/model/useCareUnitsQuery';
import { ArrowLeft } from 'lucide-react';
import { selectedCareUnitAtom } from '../atoms/selectedCareUnitAtom';

interface CareUnitSheetProps {
  lat: number | null;
  lng: number | null;
  level: number | null;
  selectedCategory: string;
  openFilter: string;
}

export default function CareUnitSheet({
  lat,
  lng,
  level,
  selectedCategory,
  openFilter,
}: CareUnitSheetProps) {
  const [open, setOpen] = useAtom(detailSheetOpenAtom);
  const [page, setPage] = useAtom(detailSheetPageAtom);
  const [selected] = useAtom(selectedCareUnitAtom);

  const roundedLat = lat ? Math.floor(lat * 1000) / 1000 : null;
  const roundedLng = lng ? Math.floor(lng * 1000) / 1000 : null;

  const { data, isLoading, isFetching, hasNextPage, fetchNextPage } =
    useCareUnitsQuery({
      lat: roundedLat,
      lng: roundedLng,
      level,
      selectedCategory,
      OpenStatus: JSON.parse(openFilter),
    });

  const getTitle = () => (page === 'list' ? '의료기관 목록' : '상세 정보');

  const getDescription = () =>
    page === 'list' ? '채팅, 즐겨찾기 설정을 해보세요' : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[90vw] sm:w-[400px]">
        <SheetHeader className="border-b">
          <div className="relative flex justify-center items-center">
            {page === 'detail' && (
              <button
                className="absolute left-0 text-muted-foreground hover:text-foreground"
                onClick={() => setPage('list')}
              >
                <ArrowLeft className="inline-block !mr-1 cursor-pointer" />
              </button>
            )}
            <SheetTitle className="text-base font-semibold">
              {getTitle()}
            </SheetTitle>
          </div>

          <SheetDescription asChild>
            <div className="relative flex justify-center items-center">
              {getDescription()}
            </div>
          </SheetDescription>
        </SheetHeader>

        {page === 'list' ? (
          <CareUnitListPage
            data={data ?? []}
            isLoading={isLoading}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        ) : (
          selected && <CareUnitDetailPage />
        )}
      </SheetContent>
    </Sheet>
  );
}
