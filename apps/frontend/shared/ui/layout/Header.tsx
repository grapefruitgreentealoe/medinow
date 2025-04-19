'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authStore } from '@/store/auth-store';
import axiosInstance from '@/lib/axios';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // 상태를 로컬 state로 반영
  const [isLoggedIn, setIsLoggedIn] = useState(authStore.getState().isLoggedIn);
  const [isAdmin, setIsAdmin] = useState(authStore.getState().isAdmin);

  // store subscribe
  useEffect(() => {
    const unsubscribe = authStore.subscribe((state) => {
      setIsLoggedIn(state.isLoggedIn);
      setIsAdmin(state.isAdmin);
    });
    return () => unsubscribe();
  }, []);

  // pathname 바뀔 때마다 localStorage → store로 싱크
  useEffect(() => {
    const isLogin = localStorage.getItem('isLogin') === 'true';
    const admin = localStorage.getItem('isAdmin') === 'true';

    const state = authStore.getState();
    if (isLogin && (!state.isLoggedIn || state.isAdmin !== admin)) {
      authStore.setState({ isLoggedIn: true, isAdmin: admin });
    }
    if (!isLogin && state.isLoggedIn) {
      authStore.getState().logout();
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.post('/auth/logout', null, {
        withCredentials: true,
      });
      if (res.status === 200) {
        authStore.getState().logout();
        localStorage.removeItem('isLogin');
        localStorage.removeItem('isAdmin');
        router.push('/');
      }
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <header className="w-full px-6 py-4 border-b flex justify-between items-center bg-white">
      <Link href="/" className="text-xl font-bold ">
        <span className="text-black">🏥 Medinow</span>
      </Link>
      <nav className="flex gap-4">
        {isLoggedIn ? (
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-black"
          >
            로그아웃
          </Button>
        ) : (
          <>
            <Link href="/signup/admin">
              <Button variant="outline" className="text-black">
                관리자 회원가입
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="outline" className="text-black">
                회원가입
              </Button>
            </Link>
            <Link href="/login">
              <Button>로그인</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
