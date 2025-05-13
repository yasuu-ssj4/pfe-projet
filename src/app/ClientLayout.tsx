'use client';
import { usePathname } from 'next/navigation';
import Sidebar from './dashboard/sideBar';
import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/login';

  return (
    <div className="flex min-h-screen bg-gray-50 layout print:block">
      {showSidebar && (
        <div className="sidebar w-64 print:hidden">
          <Sidebar />
        </div>
      )}
      <div className="main-content flex-1">{children}</div>
    </div>
  );
}
