'use client';

import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/css/animate.min.css';
import './styles/css/light-bootstrap-dashboard-react.css';
import './styles/css/demo.css';

import AdminLayout from './admin/AdminLayout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AdminLayout>
          {children}
        </AdminLayout>
      </body>
    </html>
  );
}
