'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

export default function Loading() {
  const [progress, setProgress] = useState(30); // 초기값

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95; // 최대값 제한
        return prev + Math.random() * 10;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm space-y-4">
        <p className="text-center text-muted-foreground text-sm">
          잠시만 기다려주세요
        </p>
        <Progress value={progress} className="h-2 bg-primary/10" />
      </div>
    </div>
  );
}
