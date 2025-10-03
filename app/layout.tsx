'use client';

import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/css/animate.min.css';
import './styles/css/light-bootstrap-dashboard-react.css';
import './styles/css/demo.css';

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
