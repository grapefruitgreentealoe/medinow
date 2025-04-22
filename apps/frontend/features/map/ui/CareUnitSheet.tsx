'use client';

import { useAtom } from 'jotai';
import {
  selectedCareUnitAtom,
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
import { MediListPage } from './MediListPage';
import CareUnitDetailPage from './CareUnitDetailPage';
import { useCareUnitsQuery } from '@/features/map/model/useCareUnitsQuery';
import { CareUnit } from '@/features/map/type';
import { ArrowLeft } from 'lucide-react';

interface CareUnitSheetProps {
  lat: number | null;
  lng: number | null;
  level: number;
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

  if (!open) return null;

  const getTitle = () => (page === 'list' ? '의료기관 목록' : '상세 정보');

  const getDescription = () =>
    page === 'list' ? '채팅, 즐겨찾기 설정을 해보세요' : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-[90vw] sm:w-[400px] !p-0">
        <SheetHeader className="!p-4 border-b">
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
          <MediListPage
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
