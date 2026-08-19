'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, handleLogout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState === "true") {
      setIsCollapsed(true);
    }

    const handleCollapsedChange = () => {
      const state = localStorage.getItem("sidebarCollapsed");
      setIsCollapsed(state === "true");
    };

    window.addEventListener("sidebarCollapsedChanged", handleCollapsedChange);
    window.addEventListener("storage", handleCollapsedChange);

    return () => {
      window.removeEventListener("sidebarCollapsedChanged", handleCollapsedChange);
      window.removeEventListener("storage", handleCollapsedChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="flex flex-1 min-w-0 relative">
        <Sidebar role={user?.role} />
        <main
          className={`flex-1 min-w-0 px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:pt-8 md:pb-12 w-full ${
            mounted ? "transition-all duration-300" : "transition-none"
          } ${isCollapsed ? 'md:ml-20 max-w-full' : 'md:ml-64 max-w-7xl mx-auto'}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
