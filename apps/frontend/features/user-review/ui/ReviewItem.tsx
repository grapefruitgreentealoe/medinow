'use client';

import { Button } from '@/components/ui/button';
import { ReviewData } from '../type';
import { Star } from 'lucide-react';
import { CareUnitCardLayout } from '@/shared/ui/CardLayout';

export function ReviewItem({
  review,
  onEdit,
  onDelete,
  onDetail,
  isAdmin = false,
}: {
  review: ReviewData;
  onEdit: () => void;
  onDelete: () => void;
  onDetail: () => void;
  isAdmin?: boolean;
}) {
  return (
    <CareUnitCardLayout
      title={review.careUnitName}
      cta={
        !isAdmin ? (
          <div className="flex gap-2 !mt-1">
            <Button size="sm" variant="link" onClick={onDetail}>
              상세보기
            </Button>
            <Button size="sm" variant="outline" onClick={onEdit}>
              수정
            </Button>
            <Button size="sm" variant="outline" onClick={onDelete}>
              삭제
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="link" onClick={onDetail}>
            상세보기
          </Button>
        )
      }
    >
      {/* 본문 부분 */}
      <div className="text-sm text-muted-foreground">
        {review.departmentName}
      </div>

      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Star size={14} className="text-yellow-400 fill-yellow-400" />
        {review.rating}
      </div>

      <p className="text-sm text-foreground line-clamp-2">{review.content}</p>
    </CareUnitCardLayout>
  );
}
