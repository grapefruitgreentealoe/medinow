'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import LocationSearchModal from '@/shared/ui/LocationSearchModal';
import { checkCareUnitExist } from '@/shared/api';
import { useSetAtom, useAtomValue } from 'jotai';
import {
  selectedCareUnitIdAtom,
  selectedCareUnitAtom,
  selectedDepartmentIdAtom,
  selectedDepartmentsAtom,
} from '../atoms/reviewFormAtom';

export function SearchCareUnitForReview() {
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState('');
  const selected = useAtomValue(selectedCareUnitAtom);
  const setId = useSetAtom(selectedCareUnitIdAtom);
  const setCareUnit = useSetAtom(selectedCareUnitAtom);
  const setDepartments = useSetAtom(selectedDepartmentsAtom);

  const handleSelect = async ({
    name,
    address,
  }: {
    name: string;
    address: string;
  }) => {
    const result = await checkCareUnitExist({ name, address, category });
    if (result?.id) {
      setId(result.id);
      setCareUnit(result);
      setDepartments(result.departments || []);
      setModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">병원 카테고리</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="">카테고리를 선택하세요</option>
        <option value="emergency">응급실</option>
        <option value="hospital">병원</option>
        <option value="pharmacy">약국</option>
      </select>

      <div className="flex gap-2">
        <Input
          value={selected?.name || ''}
          placeholder="병원명을 선택하세요"
          readOnly
          onClick={() => setModalOpen(true)}
        />
        <Button onClick={() => setModalOpen(true)}>병원 검색하기</Button>
      </div>

      {selected && (
        <Card className="bg-muted">
          <CardContent className="p-4 space-y-1">
            <p className="text-sm text-muted-foreground">선택된 병원</p>
            <h3 className="text-base font-bold">{selected.name}</h3>
            <p className="text-sm text-muted-foreground">{selected.address}</p>
          </CardContent>
        </Card>
      )}

      <LocationSearchModal
        title="병원 위치 검색"
        subtitle="병원명을 입력하세요"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  );
}
