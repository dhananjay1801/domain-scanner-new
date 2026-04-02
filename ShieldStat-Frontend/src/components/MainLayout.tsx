'use client'

import React from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isCollapsed, hideSidebar } = useSidebar();

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
