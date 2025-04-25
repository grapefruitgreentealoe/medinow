'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import axiosInstance from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';

interface User {
  email: string;
  name: string;
  address: string;
  age: number;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    axiosInstance
      .get('/users', { withCredentials: true })
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  if (!user) {
    return (
      <div className="space-y-4 flex flex-col w-full gap-[20px] !p-[20px] m-[20px]">
        <Skeleton className="h-[60px] w-full" />
        <Skeleton className="h-[60px] w-full" />
        <Skeleton className="h-[60px] w-full" />
      </div>
    );
  }

  return (
    <Card className="max-w-5xl !m-[20px]">
      <CardContent className="p-6">
        <div className="h-auto flex flex-col gap-[20px] !p-[20px]">
          <div className="h-[60px] w-full">
            <p className="text-sm text-muted-foreground">이메일</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div className="h-[60px] w-full">
            <p className="text-sm text-muted-foreground">이름</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div className="h-[60px] w-full">
            <p className="text-sm text-muted-foreground">나이</p>
            <p className="font-medium">{user.age}</p>
          </div>
          <div className="h-[60px] w-full">
            <p className="text-sm text-muted-foreground">주소</p>
            <p className="font-medium">{user.address}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
