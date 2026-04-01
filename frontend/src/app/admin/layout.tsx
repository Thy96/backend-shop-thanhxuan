import '../globals.css'; // nếu bạn cần global styles
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import ScrollTop from '@/components/ui/ScrollTop';
import { getMe } from '@/lib/api/apiAuth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getMe();

  if (!me?.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto h-screen">
        <ScrollTop />
        {children}
      </main>
    </div>
  );
}
