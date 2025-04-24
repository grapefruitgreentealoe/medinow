'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useState } from 'react';

const mockFavorites = [
  {
    id: 1,
    name: '서울 종합 병원',
    address: '서울시 강남구 테헤란로 123',
    category: '응급실',
  },
  {
    id: 2,
    name: '연세 메디컬 센터',
    address: '서울시 서초구 반포대로 222',
    category: '병원',
  },
  {
    id: 3,
    name: '강남 세브란스 병원',
    address: '서울시 강남구 언주로 211',
    category: '약국',
  },
];

export default function FavoritePage() {
  const [page, setPage] = useState(1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">즐겨찾기 병원</h1>
      <div className="grid gap-4">
        {mockFavorites.map((hospital) => (
          <Card key={hospital.id}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="font-medium text-lg">{hospital.name}</div>
              <div className="text-sm text-muted-foreground">
                {hospital.address}
              </div>
              <div className="text-sm text-gray-500">
                카테고리: {hospital.category}
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm">
                  리뷰 작성
                </Button>
                <Button variant="secondary" size="sm">
                  감사 메시지
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext onClick={() => setPage((p) => p + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
