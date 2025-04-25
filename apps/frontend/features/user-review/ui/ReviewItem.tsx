import { Button } from '@/components/ui/button';
import { ReviewData } from '../type';

export function ReviewItem({
  review,
  onEdit,
  onDelete,
}: {
  review: ReviewData;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold leading-none">
            {review.careUnitName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {review.departmentName}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">⭐ {review.rating}</div>
      </div>
      <p className="text-sm text-foreground line-clamp-2">{review.content}</p>
      <div className="flex gap-2 justify-end">
        <Button size="sm" variant="outline" onClick={onEdit}>
          수정
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          삭제
        </Button>
      </div>
    </div>
  );
}
