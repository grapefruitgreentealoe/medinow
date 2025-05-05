'use client';

import AdminSignupForm from '@/features/auth/ui/AdminSignupForm';

export default function AdminSignupPage() {
  return (
    <div className="max-w-2xl !mx-auto !py-10 !px-4">
      <h1 className="text-xl font-bold mb-6 text-center text-primary">
        의료기관 회원가입
      </h1>
      <AdminSignupForm />
    </div>
  );
}
