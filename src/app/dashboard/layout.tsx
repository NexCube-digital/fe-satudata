'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/use-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, handleLogout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleCollapsedChange = () => {
      const savedState = localStorage.getItem("sidebarCollapsed");
      setIsCollapsed(savedState === "true");
    };

    handleCollapsedChange();
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
          className={`flex-1 min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full transition-all duration-300 ${
            isCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
