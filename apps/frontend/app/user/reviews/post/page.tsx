'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CareUnit } from '@/features/map/type';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function WriteReviewPage() {
  const searchParams = useSearchParams();
  const careUnitId = searchParams.get('careUnitId');

  const [careUnit, setCareUnit] = useState<CareUnit | null>(null);

  useEffect(() => {
    if (careUnitId) {
      // 병원 정보 가져오기 (careUnitId로 조회)
      fetch(`/api/care-units/${careUnitId}`)
        .then((res) => res.json())
        .then((data) => setCareUnit(data));
    }
  }, [careUnitId]);

  return (
    <div className="space-y-6 max-w-xl mx-auto py-6">
      <h1 className="text-2xl font-semibold">리뷰 작성</h1>

      {careUnit && (
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">리뷰 대상 병원</p>
          <p className="font-medium text-lg">{careUnit.name}</p>
          <p className="text-sm text-muted-foreground">{careUnit.address}</p>
        </div>
      )}

      <Textarea placeholder="리뷰 내용을 작성해주세요." rows={6} />

      <Input placeholder="감사 메시지 (선택)" />

      <Button type="submit" className="mt-4">
        리뷰 등록
      </Button>
    </div>
  );
}
