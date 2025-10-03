'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from "@/lib/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/lib/components/ui/sheet";
import { Card, CardContent, CardHeader } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { Separator } from "@/lib/components/ui/separator";
import { Menu, Home, Book, List, Image as ImageIcon, Bell, Settings, Users, BarChart3, LogOut, User } from "lucide-react";
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
  { name: 'Publish Books', href: '/admin/publishbooks', icon: Book },
  { name: 'Book List', href: '/admin/bookslist', icon: List },
  { name: 'Categories', href: '/admin/categories', icon: Users },
  { name: 'Banner Image', href: '/admin/banner', icon: ImageIcon },
  { name: 'Notification Form', href: '/admin/notificationform', icon: Bell },
  { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>ChapterSnap Admin</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center">
            <img
              src="/img/ChapterSnap.png"
              alt="ChapterSnap Logo"
              className="h-6 w-6 object-contain"
            />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-card border-r">
            <div className="flex items-center px-6 py-4 border-b">
              <img
                src="/img/ChapterSnap.png"
                alt="ChapterSnap Logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Admin Info Section */}
            <div className="px-4 py-4 border-t">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">admin@chaptersnap.com</p>
                  <Badge variant="secondary" className="text-xs">Admin</Badge>
                </div>
              </div>
              <Button variant="outline" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
