'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminNavbar from '@/components/Navbars/AdminNavbar';
import Footer from '@/components/Footer/Footer';
import Sidebar from '@/components/Sidebar/Sidebar';
import FixedPlugin from '@/components/FixedPlugin/FixedPlugin';
import sidebarImage from '@/assets/img/sidebar-3.jpg';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [image, setImage] = useState<string>((sidebarImage as unknown as { src: string }).src);
  const [color, setColor] = useState('black');
  const [hasImage, setHasImage] = useState(true);
  const mainPanel = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement!.scrollTop = 0;
    if (mainPanel.current) mainPanel.current.scrollTop = 0;
  }, [pathname]);

  // Data is now fetched directly in pages via Supabase server queries

  return (
    <>
      <div className="wrapper">
        <Sidebar color={color} image={hasImage ? image : ''} />
        <div className="main-panel" ref={mainPanel}>
          <AdminNavbar />
          <div className="content">{children}</div>
          <Footer />
        </div>
      </div>
      <FixedPlugin
        hasImage={hasImage}
        setHasImage={() => setHasImage(!hasImage)}
        color={color}
        setColor={(color: string) => setColor(color)}
        image={image}
        setImage={(image: string) => setImage(image)}
      />
    </>
  );
}
