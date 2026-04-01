'use client'

import { useEffect } from 'react';
import { useSidebar } from '@/context/SidebarContext';

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  const { setHideSidebar } = useSidebar();

  useEffect(() => {
    setHideSidebar(true);
    return () => setHideSidebar(false);
  }, [setHideSidebar]);

  return <>{children}</>;
}
