'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCareUnitById } from '@/features/user-review/api';
import { CareUnit } from '@/features/map/type';
import { ReviewForm } from '@/features/user-review/ui/ReviewForm';
import { SearchCareUnitForReview } from '@/features/user-review/ui/SearchCareUnitForReview';

export default function WriteReviewPage() {
  const searchParams = useSearchParams();
  const careUnitId = searchParams.get('careUnitId');

  const [careUnit, setCareUnit] = useState<CareUnit | null>(null);

  useEffect(() => {
    if (careUnitId) {
      getCareUnitById(careUnitId).then(setCareUnit);
    }
  }, [careUnitId]);

  return (
    <main className="min-h-screen px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">리뷰 작성</h1>

      {!careUnitId && !careUnit && (
        <SearchCareUnitForReview onSelect={setCareUnit} />
      )}

      {careUnitId && !careUnit && <p>병원 정보를 불러오는 중...</p>}

      {careUnit && <ReviewForm careUnit={careUnit} />}
    </main>
  );
}
