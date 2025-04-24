import { FloatingChatWidget } from '@/widgets/chat/FloatingChatWidget';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <section>{children}</section>
      <FloatingChatWidget />
    </div>
  );
}
