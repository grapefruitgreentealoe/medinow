'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number; // 현재 값
  onChange: (val: number) => void;
  max?: number; // 기본 5개
}

export function StarRating({ value, onChange, max = 5 }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = (val: number) => {
    onChange(val);
  };

  const handleMouseEnter = (val: number) => {
    setHoverValue(val);
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const displayValue = hoverValue ?? value;

  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => {
        const current = i + 1;
        return (
          <Star
            key={i}
            size={20}
            className={cn(
              'cursor-pointer transition-colors',
              current <= displayValue
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            )}
            onMouseEnter={() => handleMouseEnter(current)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(current)}
          />
        );
      })}
    </div>
  );
}
