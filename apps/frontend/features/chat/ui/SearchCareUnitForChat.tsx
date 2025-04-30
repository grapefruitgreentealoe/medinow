'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import LocationSearchModal from '@/shared/ui/LocationSearchModal';
import { checkCareUnitExist } from '@/shared/api';
import { CareUnit } from '@/shared/type';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function SearchCareUnitForChat() {
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [selectedCareUnit, setSelectedCareUnit] = useState<CareUnit | null>(
    null
  );
  const router = useRouter();

  const handleSelect = async ({
    name,
    address,
  }: {
    name: string;
    address: string;
  }) => {
    if (!category) {
      toast.warning('카테고리를 먼저 선택하세요');
      return;
    }
    const result = await checkCareUnitExist({ name, address, category });
    if (result?.id) {
      setSelectedCareUnit(result as CareUnit);
      setModalOpen(false);

      // 의료기관 선택 완료 → 채팅 페이지 이동
      router.push(`/user/chat?id=${result.id}`);
    } else {
      toast.error('의료기관을 찾을 수 없습니다.');
    }
  };

  return (
    <div className="!space-y-6 max-w-full mx-auto py-6">
      <div className="">
        <h2 className="text-lg font-bold">채팅할 의료기관 선택</h2>
        <div className="!space-y-1">
          <label className="text-sm font-medium">의료기관 카테고리</label>
          <Select onValueChange={setCategory} value={category}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="카테고리를 선택하세요" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="emergency">응급실</SelectItem>
              <SelectItem value="hospital">의료기관</SelectItem>
              <SelectItem value="pharmacy">약국</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="!space-y-1">
          <label className="text-sm font-medium">의료기관명 검색</label>
          <Input
            value={selectedCareUnit?.name || ''}
            placeholder="의료기관명을 선택하세요"
            readOnly
            onClick={() => {
              if (category) {
                setModalOpen(true);
              } else {
                toast.warning('카테고리를 먼저 선택하세요');
              }
            }}
          />
        </div>

        {selectedCareUnit && (
          <Card className="bg-muted/50 border">
            <CardContent className="!space-y-1">
              <p className="text-xs text-muted-foreground">선택된 의료기관</p>
              <h3 className="text-base font-bold">{selectedCareUnit.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedCareUnit.address}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {modalOpen && (
        <LocationSearchModal
          title="의료기관 위치 검색"
          subtitle="의료기관명을 입력하세요"
          open={true}
          onClose={() => setModalOpen(false)}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
}
