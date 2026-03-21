import '../globals.css'; // nếu bạn cần global styles
import Sidebar from '@/components/layout/Sidebar';
import ScrollTop from '@/components/ui/ScrollTop';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
