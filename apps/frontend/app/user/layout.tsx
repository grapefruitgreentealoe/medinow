// app/user/layout.tsx
import { ReactNode } from 'react';
import { Sidebar } from '@/features/user/ui/Sidebar';
import { Card, CardContent } from '@/components/ui/card';

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted">
      <aside className="w-[240px] border-r border-border p-6 bg-background">
        <Sidebar />
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
