import SignupForm from '@/features/auth/ui/SignupForm';

export default function SignupPage() {
  return (
    <div className="flex items-start justify-center min-h-[80vh] !px-4 !mt-[30px]">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-xl font-bold text-center text-primary">회원가입</h1>
        <div className="h-[20px]" />
        <SignupForm />
      </div>
    </div>
  );
}
