'use client';

import { useAtom } from 'jotai';
import { selectedCareUnitAtom } from '@/features/map/atoms/detailSheetAtoms';

export default function DetailPage() {
  const [unit] = useAtom(selectedCareUnitAtom);

  return (
    <div className="p-4 space-y-2 text-sm">
      <p>
        <strong>주소:</strong> {unit?.address}
      </p>
      <p>
        <strong>전화:</strong> <a href={`tel:${unit?.tel}`}>{unit?.tel}</a>
      </p>
      {/* 추가 정보 */}
    </div>
  );
}
