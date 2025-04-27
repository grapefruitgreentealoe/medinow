'use client';

import { Star } from 'lucide-react';

interface ReviewBodyProps {
  rating: number;
  content: string;
  thankMessage?: string;
  createdAt: string;
  nickname?: string;
}

export function ReviewBody({
  rating,
  content,
  thankMessage,
  createdAt,
  nickname = '',
}: ReviewBodyProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (rating >= i + 1) {
        stars.push(
          <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
        );
      } else if (rating > i) {
        stars.push(
          <Star
            key={i}
            size={16}
            className="text-yellow-400 fill-yellow-400 opacity-50"
          />
        );
      } else {
        stars.push(
          <Star key={i} size={16} className="text-muted-foreground" />
        );
      }
    }
    return <div className="flex items-center gap-1">{stars}</div>;
  };
  console.log(nickname);
  return (
    <div className="!space-y-2">
      {nickname ? (
        <div className="text-sm text-muted-foreground">작성자: {nickname}</div>
      ) : null}
      {/* 작성일 */}
      <div className="text-xs text-muted-foreground mt-4">
        {new Date(createdAt).toLocaleDateString('ko-KR')}
      </div>
      {/* 별점 */}
      <div>{renderStars(rating)}</div>
      {/* 리뷰 내용 */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground mb-1">
          리뷰 내용
        </div>
        <p className="text-sm text-foreground whitespace-pre-line line-clamp-4">
          {content}
        </p>
      </div>
      {/* 감사 메시지 */}
      {thankMessage && (
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-1">
            감사 메시지
          </div>
          <p className="text-xs text-muted-foreground whitespace-pre-line">
            {thankMessage}
          </p>
        </div>
      )}
    </div>
  );
}
