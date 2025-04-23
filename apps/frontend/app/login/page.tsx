import LoginForm from '@/features/auth/ui/LoginForm';

export default function LoginPage() {
  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
      <LoginForm />
    </div>
  );
}
