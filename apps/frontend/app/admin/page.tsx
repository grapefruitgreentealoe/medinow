'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { CareUnit } from '@/shared/type';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ReviewItem } from '@/features/user-review/ui/ReviewItem';
import { ReviewData } from '@/features/user-review/type';
import { getReviews } from '@/features/user-review/api';
import { ReviewBody } from '@/features/review/ui/ReviewBody';
import { Label } from '@/components/ui/label';
import { CATEGORY_LABEL } from '@/shared/constants/const';
import { user as getUser } from '@/features/user/api';

interface User {
  email: string;
  name: string;
  address: string;
  age: number;
  nickname: string;
  unitData: CareUnit;
}

// Mock unitData
const mockUnitData: CareUnit = {
  id: 'mock-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  name: '모킹 병원',
  address: '서울특별시 어딘가 123',
  tel: '02-123-4567',
  category: 'hospital',
  hpId: 'mock-hpid',
  mondayOpen: 900,
  mondayClose: 1800,
  tuesdayOpen: 900,
  tuesdayClose: 1800,
  wednesdayOpen: 900,
  wednesdayClose: 1800,
  thursdayOpen: 900,
  thursdayClose: 1800,
  fridayOpen: 900,
  fridayClose: 1800,
  saturdayOpen: 900,
  saturdayClose: 1300,
  sundayOpen: null,
  sundayClose: null,
  holidayOpen: null,
  holidayClose: null,
  lat: 37.5665,
  lng: 126.978,
  isBadged: false,
  nowOpen: true,
  kakaoUrl: null,
  isChatAvailable: true,
  isFavorite: false,
  departments: [],
  congestion: {
    hvec: 0,
    congestionLevel: 'HIGH',
    updatedAt: new Date().toISOString(),
    hpid: 'mock-hpid',
    name: '모킹 병원',
  },
  averageRating: 4.2,
  reviewCount: 12,
};

// 운영여부 변경 API
async function toggleHospitalOpenStatus(unitId: string) {
  return axiosInstance.post(`/care-units/check-now-open`, {
    id: unitId,
  });
}

// 공통 필드
function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="h-[60px] w-full">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  );
}

export default function AdminUserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<boolean>(false);
  const [recentReveiw, setRecentReview] = useState<ReviewData | null>(null);

  useEffect(() => {
    getUser()
      .then((res) => {
        const userData = res.data.user;
        if (!userData.unitData) {
          userData.unitData = mockUnitData;
        }
        setUser(userData);
      })
      .catch(() => setUser(null));

    getReviews({ pageParam: 1, limit: 1 }).then((res) => {
      const reviews = res.reviews;
      setRecentReview(reviews[0]);
    });
  }, []);

  if (!user || !recentReveiw) {
    return (
      <div className="space-y-4 flex flex-col w-full gap-[20px] !p-[20px] !m-[20px]">
        <Skeleton className="h-[60px] w-full" />
        <Skeleton className="h-[60px] w-full" />
        <Skeleton className="h-[60px] w-full" />
      </div>
    );
  }

  const handleConfirmToggle = async () => {
    if (!user) return;
    try {
      await toggleHospitalOpenStatus(user.unitData.id);
      setUser({
        ...user,
        unitData: {
          ...user.unitData,
          nowOpen: !user.unitData.nowOpen,
        },
      });
      toast.success('운영 여부가 변경되었습니다.');
    } catch (error) {
      toast.warning('변경 실패. 다시 시도해주세요.');
    }
  };

  return (
    <div className="!m-[30px]">
      <div className="flex flex-wrap gap-4 !mx-auto ">
        {/* 병원 정보 카드 */}
        <Card className="!min-w-[300px] flex-1">
          <CardHeader>
            <CardTitle>관리자 정보 및 운영상태</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col ">
            <ProfileField label="이메일" value={user.email} />
            <ProfileField label="이름" value={user.name} />
            <ProfileField
              label="운영 여부"
              value={user.unitData.nowOpen ? '운영 중' : '운영 중 아님'}
            />
            <p className="text-sm text-muted-foreground !mb-[5px]">
              운영 상태 변경
            </p>
            <Switch
              checked={user.unitData.nowOpen}
              onCheckedChange={() => setConfirmOpen(true)}
            />
          </CardContent>
        </Card>

        <Card className="flex-1 !min-w-[300px]">
          <CardHeader>
            <CardTitle>병원 정보</CardTitle>
          </CardHeader>
          <CardContent className="w-full flex flex-col">
            <ProfileField label="병원명" value={user.unitData.name} />
            <ProfileField label="전화번호" value={user.unitData.tel} />
            <ProfileField
              label="카테고리"
              value={CATEGORY_LABEL[user.unitData.category]}
            />
            <ProfileField label="주소" value={user.unitData.address} />
          </CardContent>
        </Card>
      </div>

      <div className="!m-[20px] !mx-auto">
        <Label className="text-xl text-bold !mb-3">최근 리뷰</Label>
        <Card>
          <CardContent>
            <ReviewBody
              nickname={recentReveiw.nickname}
              rating={recentReveiw.rating}
              content={recentReveiw.content}
              createdAt={recentReveiw.createdAt}
              thankMessage={recentReveiw.thankMessage}
            />
          </CardContent>
        </Card>
      </div>
      {/* Confirm Modal */}
      <ConfirmDialog
        open={confirmOpen}
        onConfirm={() => {
          setConfirmOpen(false);
          handleConfirmToggle();
        }}
        onClose={() => setConfirmOpen(false)}
        title="운영 상태 변경"
        description={`병원의 운영 상태를 ${user.unitData.nowOpen ? '운영 중지' : '운영 시작'}로 변경하시겠습니까?`}
      />
    </div>
  );
}
