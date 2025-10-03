'use client';

import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/lib/components/ui/button";
import AuthButton from "./AuthButton";

export default function AdminNavbar() {
  const pathname = usePathname();

  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");

    const node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      if (this.parentElement) {
        this.parentElement.removeChild(this);
        document.documentElement.classList.toggle("nav-open");
      }
    };
    document.body.appendChild(node);
  };

  // Map pathname segments to brand text
  const getBrandText = () => {
    if (!pathname) return "Brand";

    if (pathname.includes("/admin/dashboard")) return "Dashboard";
    if (pathname.includes("/admin/user-profile")) return "User Profile";
    if (pathname.includes("/admin/table-list")) return "Table List";
    if (pathname.includes("/admin/typography")) return "Typography";
    if (pathname.includes("/admin/icons")) return "Icons";
    if (pathname.includes("/admin/maps")) return "Maps";
    if (pathname.includes("/admin/notifications")) return "Notifications";

    return "Brand";
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={mobileSidebarToggle}
          >
            <i className="fas fa-ellipsis-v"></i>
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">
            {getBrandText()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
