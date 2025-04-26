'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Star,
  StarOff,
  MessageSquare,
  PhoneCallIcon,
  NotepadTextIcon,
  PenBoxIcon,
  ThumbsUpIcon,
  PencilIcon,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { unfavoriteConfirmUnitAtom } from '../atoms/unfavoriteConfirmModalAtom';
import { openKakaoMap, renderTodayTime } from '@/features/map/utils';
import { CATEGORY_LABEL, congestionClassMap } from '@/features/map/const';
import { CareUnit, CongestionLevel } from '@/shared/type';
import { chatModalAtom } from '@/features/chat/atoms/chatModalAtom';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/shared/constants/routes';

interface CareUnitCardProps {
  unit: CareUnit;
  onSelect: (unit: CareUnit) => void;
  onConfirmUnfavorite: () => void;
  currentPage: number;
}

export function CareUnitCard({
  unit,
  onSelect,
  onConfirmUnfavorite,
  currentPage,
}: CareUnitCardProps) {
  const setConfirmUnit = useSetAtom(unfavoriteConfirmUnitAtom);
  const setChat = useSetAtom(chatModalAtom);
  const router = useRouter();

  const handleFavoriteButton = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (unit.isFavorite) {
      setConfirmUnit(unit); // 모달로 단건 정보 넘기고
      onConfirmUnfavorite(); // 모달 오픈
    }
  };

  const handleUrlButton = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    openKakaoMap(unit);
  };

  const level = (unit?.congestion?.congestionLevel ?? 'LOW') as CongestionLevel;

  return (
    <Card
      key={unit.id}
      className={cn(
        'mb-4 cursor-pointer hover:shadow-md bg-background transition-shadow  border-t-0 border-l-0 border-r-0 border-b-[1px] border-b-slate-300 border-solid'
      )}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '64px' }}
    >
      <CardContent className="!p-5 space-y-4">
        {/* 제목 + 주소 */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-primary">{unit.name}</h3>
          <p className="text-sm text-muted-foreground leading-snug">
            {unit.address}
          </p>
        </div>

        {/* 태그들 */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="bg-muted text-muted-foreground !px-2 !py-0.5 rounded-full">
            {CATEGORY_LABEL[unit.category]}
          </span>
          {unit?.congestion?.congestionLevel && (
            <span className={congestionClassMap[level]}>혼잡도: {level}</span>
          )}
          <span className="bg-muted text-muted-foreground !px-2 !py-0.5 rounded-full">
            {unit.nowOpen ? '🟢 운영 중' : '🔴 운영 종료'}
          </span>
        </div>

        {/* 운영시간 */}
        <div className="text-sm text-muted-foreground">
          ⏰ 오늘 운영시간:{' '}
          <span className="text-foreground font-medium">
            {renderTodayTime(unit)}
          </span>
        </div>

        {/* 기능 버튼 */}
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2 items-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs !px-0"
              onClick={handleUrlButton}
            >
              길찾기
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary text-xs !px-0"
              onClick={() => onSelect(unit)}
            >
              상세보기
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleFavoriteButton}
              className="w-8 h-8"
            >
              {unit?.isFavorite ? (
                <Star className="text-yellow-500 fill-yellow-500" size={18} />
              ) : (
                <StarOff size={18} />
              )}
            </Button>
            {unit.isChatAvailable && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setChat({ isOpen: true, target: unit });
                }}
                className="w-8 h-8"
              >
                <MessageSquare className="text-blue-500" size={18} />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                router.push(
                  ROUTES.USER.WRITE_REVIEW + `?careUnitId=${unit.id}`
                );
              }}
              className="w-8 h-8"
            >
              <PencilIcon className="text-blue-500" size={18} />
            </Button>

            {unit.tel && (
              <a href={`tel:${unit.tel}`}>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-8 h-8"
                >
                  <PhoneCallIcon className="text-slate-500" size={18} />
                </Button>
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
