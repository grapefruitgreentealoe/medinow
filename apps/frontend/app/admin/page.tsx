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
import { Badge } from '@/components/ui/badge';
import { useRenderTimeRow } from '@/shared/model/useRenderTimeRow';
import { ContentDialog } from '@/shared/ui/ContentDialog';

interface User {
  user: {
    email: string;
    name: string;
    address: string;
    age: number;
    nickname: string;
  };

  unitData: CareUnit;
}

// 운영여부 변경 API
async function toggleHospitalOpenStatus(isReverse: boolean) {
  return axiosInstance.patch(`/care-units/update-now-open`, {
    isReverse,
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
    <div className="h-[60px]">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  );
}

export default function AdminUserProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [recentReveiw, setRecentReview] = useState<ReviewData | null>(null);
  const [isReverse, setIsReverse] = useState(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isTimeTableOpen, setIsTimeTableOpen] = useState<boolean>(false);
  useEffect(() => {
    getUser()
      .then((res) => {
        const userData = res.data;
        setUser(userData);
        setIsOpen(userData.unitData.nowOpen);
        setIsReverse(userData.unitData.isReverse); // 먼저 데이터를 가져온다.
      })
      .catch(() => setUser(null));

    getReviews({ pageParam: 1, limit: 1 }).then((res) => {
      const reviews = res.reviews;
      setRecentReview(reviews?.[0] ?? []);
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
      const { data } = await toggleHospitalOpenStatus(!isReverse);
      toast.success(data.message);
      setIsReverse(data.isReverse);
      setIsOpen(data.isOpen);
    } catch (error) {
      toast.warning('변경 실패. 다시 시도해주세요.');
    }
  };

  const handleConfirmIsReverse = () => {
    setConfirmOpen(false);
    handleConfirmToggle();
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
            <ProfileField label="이메일" value={user.user.email} />
            <ProfileField label="이름" value={user.user.name} />

            <div className="flex items-center justify-start ">
              <ProfileField
                label="현재 운영 상태"
                value={isOpen ? '운영 중' : '운영 중 아님'}
              />
              {isReverse ? (
                <Badge
                  variant={isReverse ? 'secondary' : 'default'}
                  className="inline-block"
                >
                  {'수동 전환 됨'}
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground !mb-[5px]">
              수동 전환 버튼
            </p>
            <p className="text-xs text-muted-foreground !mb-[5px]">
              활성화 시, 운영시간표 기준과 반대 상태로 전환됩니다.
            </p>
            <Switch
              checked={isReverse} //
              onCheckedChange={() => {
                setConfirmOpen(true); //모달을 연다
              }}
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
            {/* ✨ 여기 추가하면 좋아 */}
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-fit self-end"
              onClick={() => setIsTimeTableOpen(true)}
            >
              운영시간 보기
            </Button>
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
        onConfirm={handleConfirmIsReverse} //확인시 핸들러 실행
        onClose={() => setConfirmOpen(false)}
        title="운영 상태 변경"
        description={`운영 상태를 변경하시겠습니까?`}
      />
      <ContentDialog
        open={isTimeTableOpen}
        onClose={() => setIsTimeTableOpen(false)}
        title="운영시간표"
      >
        <div className="grid grid-cols-[80px_1fr] gap-y-1 gap-x-4">
          {useRenderTimeRow(
            '월요일',
            user.unitData.mondayOpen,
            user.unitData.mondayClose
          )}
          {useRenderTimeRow(
            '화요일',
            user.unitData.tuesdayOpen,
            user.unitData.tuesdayClose
          )}
          {useRenderTimeRow(
            '수요일',
            user.unitData.wednesdayOpen,
            user.unitData.wednesdayClose
          )}
          {useRenderTimeRow(
            '목요일',
            user.unitData.thursdayOpen,
            user.unitData.thursdayClose
          )}
          {useRenderTimeRow(
            '금요일',
            user.unitData.fridayOpen,
            user.unitData.fridayClose
          )}
          {useRenderTimeRow(
            '토요일',
            user.unitData.saturdayOpen,
            user.unitData.saturdayClose
          )}
          {useRenderTimeRow(
            '일요일',
            user.unitData.sundayOpen,
            user.unitData.sundayClose
          )}
          {useRenderTimeRow(
            '공휴일',
            user.unitData.holidayOpen,
            user.unitData.holidayClose
          )}
        </div>
      </ContentDialog>
    </div>
  );
}
