'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  MapPin,
  MessageSquare,
  Star,
  Clock,
  HeartPulse,
  Search,
  Users,
  Shield,
  Bookmark,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 히어로 섹션 */}
      <section className="flex flex-col items-center justify-center px-4 py-24 text-center bg-gradient-to-b from-background to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-foreground md:text-5xl lg:text-6xl mb-6">
            실시간 의료 정보 플랫폼
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            MediNow는 사용자의 실시간 위치를 기반으로 주변 의료 시설 정보를
            제공하고, 의료 종사자와 환자 간 직접적인 소통을 돕는 의료 정보
            플랫폼입니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/map">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
              >
                지금 바로 시작하기
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                variant="outline"
                size="lg"
                className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg"
              >
                회원가입
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 문제 해결 섹션 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            개발 동기
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            의료 정보 접근이 어려운 환자들과, 과중한 업무에 시달리는 의료
            종사자들 사이의 간극을 줄이고자 시작된 프로젝트입니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-md border-border">
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  환자들의 어려움
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  환자들은 "지금, 여기서 가능한" 의료서비스를 찾기 힘들고,
                  응급실을 전전하다 치료가 늦어지는 문제(응급실 뺑뺑이)가
                  발생합니다.
                </p>
                <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
                  "급하게 병원을 가야하는데 지금 운영하는지 확인할 수 있으면
                  좋겠어요"
                  <p className="mt-2 text-sm">
                    - 박용선(30), 서울에서 홀로 자취 중인 개발자
                  </p>
                </blockquote>
              </CardContent>
            </Card>

            <Card className="shadow-md border-border">
              <CardHeader>
                <CardTitle className="text-xl text-primary">
                  의료 기관의 어려움
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  의료 기관 역시 당직 인원 부족, 반복적인 응대 등의 문제로
                  피로도가 높습니다. 환자와의 효율적인 소통 채널이 부족하고,
                  실시간 정보 제공에 어려움을 겪고 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            주요 기능
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            MediNow는 환자와 의료진 모두에게 필요한 다양한 기능을 제공합니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MapPin className="w-10 h-10 text-primary" />}
              title="실시간 위치 기반 검색"
              description="사용자 위치를 기반으로 주변의 병원, 약국, 응급실을 지도에서 쉽게 찾을 수 있습니다."
            />
            <FeatureCard
              icon={<Clock className="w-10 h-10 text-primary" />}
              title="운영 상태 필터링"
              description="현재 운영 중인 의료 시설만 필터링하여 불필요한 시간 낭비를 방지합니다."
            />
            <FeatureCard
              icon={<Users className="w-10 h-10 text-primary" />}
              title="실시간 혼잡도 정보"
              description="응급실 병상 가용 현황 등 실시간 혼잡도를 시각적으로 확인할 수 있습니다."
            />
            <FeatureCard
              icon={<MessageSquare className="w-10 h-10 text-primary" />}
              title="실시간 채팅"
              description="의료기관과 실시간으로 소통하고 방문 전 필요한 정보를 얻을 수 있습니다."
            />
            <FeatureCard
              icon={<Star className="w-10 h-10 text-accent" />}
              title="리뷰 시스템"
              description="다른 사용자들의 경험을 참고하여 의료기관을 선택하는 데 도움을 받을 수 있습니다."
            />
            <FeatureCard
              icon={<Bookmark className="w-10 h-10 text-accent" />}
              title="즐겨찾기 기능"
              description="자주 이용하는 의료 시설을 즐겨찾기하여 빠르게 접근할 수 있습니다."
            />
          </div>
        </div>
      </section>

      {/* 사용자 유형 섹션 */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            사용자 유형
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-12">
            MediNow는 환자와 의료 기관 모두를 위한 서비스를 제공합니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="shadow-lg border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="text-primary" /> 일반 사용자
                </CardTitle>
                <CardDescription>환자를 위한 서비스</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <FeatureListItem text="의료 시설 정보 조회" />
                  <FeatureListItem text="리뷰 작성 및 조회" />
                  <FeatureListItem text="의료진과 실시간 채팅" />
                  <FeatureListItem text="자주 이용하는 병원 즐겨찾기" />
                  <FeatureListItem text="현재 위치 기반 병원 검색" />
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-t-4 border-t-accent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Shield className="text-accent" /> 의료 기관 관리자
                </CardTitle>
                <CardDescription>의료 종사자를 위한 서비스</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <FeatureListItem text="시설 정보 관리" />
                  <FeatureListItem text="환자와 실시간 채팅" />
                  <FeatureListItem text="리뷰 관리 및 응대" />
                  <FeatureListItem text="운영 시간 및 혼잡도 정보 업데이트" />
                  <FeatureListItem text="환자 문의 관리" />
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 서비스 소개 섹션 */}
      <section className="py-20 px-4 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                더 이상 병원을 찾아 헤매지 마세요
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                MediNow는 사용자 위치를 기반으로 주변의 의료기관을 쉽게 찾을 수
                있게 도와줍니다. 실시간 운영 정보와 대기 시간을 확인하고,
                의료진과 직접 소통할 수 있습니다.
              </p>
              <div className="bg-card p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-primary mb-4">
                  MediNow가 해결하는 문제
                </h3>
                <ul className="space-y-3">
                  <FeatureListItem text="응급실 뺑뺑이 문제 해결" />
                  <FeatureListItem text="실시간 의료 정보 접근성 향상" />
                  <FeatureListItem text="의료진-환자 간 소통 개선" />
                  <FeatureListItem text="의료 서비스 선택의 불확실성 감소" />
                </ul>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-card p-8 rounded-lg shadow-lg">
                <div className="flex justify-center items-center mb-6">
                  <HeartPulse size={64} className="text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-center text-foreground mb-4">
                  수상 경력
                </h3>
                <p className="text-muted-foreground mb-4 text-center">
                  🥇 엘리스 부트캠프 최종 프로젝트 수상팀
                </p>
                <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
                  의료기관 위치 기반 서비스 구축을 통해 실제 사회 문제 해결에
                  기여하고자 했으며, 지도 및 공공 API 활용, 기관별 계정·채팅
                  기능 구현 등으로 서비스 완성도를 높였습니다. 체계적인 협업과
                  안정적인 배포 환경 구축 경험은 팀의 기술적 성장에도 크게
                  기여했습니다.
                  <p className="mt-2 text-sm font-normal">- 심사평</p>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 px-4 bg-primary text-primary-foreground text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            지금 바로 MediNow와 함께하세요
          </h2>
          <p className="text-lg mb-8 text-primary-foreground/80">
            언제 어디서나 필요한 의료 서비스를 쉽고 빠르게 찾을 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/map">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 py-6 min-w-[200px] text-lg"
              >
                서비스 시작하기
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 px-8 py-6 min-w-[200px] text-lg"
              >
                회원가입
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-12 px-4 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <HeartPulse className="text-primary mr-2" size={24} />
              <span className="text-2xl font-bold text-foreground">
                MediNow
              </span>
            </div>
            <div className="flex gap-6">
              <Link
                href="/map"
                className="text-muted-foreground hover:text-primary"
              >
                지도
              </Link>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-primary"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-muted-foreground hover:text-primary"
              >
                회원가입
              </Link>
              <Link
                href="/signup/admin"
                className="text-muted-foreground hover:text-primary"
              >
                관리자 회원가입
              </Link>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} MediNow. All rights reserved.</p>
            <div className="mt-1 text-xs">Created by 삼시세코</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="flex flex-col items-center p-6 bg-card rounded-lg shadow-md hover:shadow-lg transition-shadow h-full">
      <CardHeader className="pb-2 pt-4 w-full flex flex-col items-center">
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl font-bold text-foreground text-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center">{description}</p>
      </CardContent>
    </Card>
  );
}

function FeatureListItem({ text }: { text: string }) {
  return (
    <li className="flex items-center">
      <div className="rounded-full bg-primary/10 p-1 mr-3">
        <svg
          className="w-4 h-4 text-primary"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          ></path>
        </svg>
      </div>
      <span className="text-muted-foreground">{text}</span>
    </li>
  );
}
