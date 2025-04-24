'use client';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './dashboard/sideBar';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/login';

  return (
    <>
      {/* {showSidebar && <Sidebar />} */}
      {children}
    </>
  );
}
