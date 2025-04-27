'use client';

import { CareUnitCardLayout } from '@/shared/ui/CardLayout';
import { Star } from 'lucide-react';
import { ReviewBody } from './ReviewBody';

interface ReviewContentProps {
  content: string;
  thankMessage?: string;
  rating: number;
  createdAt: string;
}

export function ReviewContent({
  content,
  thankMessage,
  rating,
  createdAt,
}: ReviewContentProps) {
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

  return (
    <CareUnitCardLayout title={``}>
      <ReviewBody
        rating={rating}
        content={content}
        thankMessage={thankMessage}
        createdAt={createdAt}
      />
    </CareUnitCardLayout>
  );
}
