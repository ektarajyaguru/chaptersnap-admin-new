'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import AdminLayout from './admin/AdminLayout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Check if the current path is an admin route
  const isAdminRoute = pathname?.startsWith('/admin/');

  return (
    <html lang="en">
      <body>
        {isAdminRoute ? (
          <AdminLayout>{children}</AdminLayout>
        ) : (
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        )}
      </body>
    </html>
  );
}
