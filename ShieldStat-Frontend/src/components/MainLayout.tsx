'use client'

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCollapsed, hideSidebar } = useSidebar();
  const { isHydrated, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isProtectedRoute =
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/');

  useEffect(() => {
    if (isHydrated && isProtectedRoute && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isHydrated, isProtectedRoute, router]);

  if (isProtectedRoute && (!isHydrated || !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fcfcfc] px-6 text-center">
        <div className="space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative">
      {!hideSidebar && <Sidebar />}
      <main 
        className={`flex-1 min-w-0 flex flex-col h-screen overflow-hidden transition-all duration-300 ${
          hideSidebar ? 'ml-0' : isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
