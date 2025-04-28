'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function HospitalInfoCard() {
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle>City General Hospital</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-gray-600">
          123 Medical Center Dr, Cityville
        </div>
        <div className="text-sm text-gray-600">전화번호: 555-123-4567</div>
        <div className="text-sm text-gray-600">Emergency ~15분 대기</div>
        <div className="text-sm text-gray-600">Urgent Care ~30분 대기</div>
      </CardContent>
    </Card>
  );
}
