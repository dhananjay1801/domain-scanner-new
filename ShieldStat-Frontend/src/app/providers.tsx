'use client'

import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <AuthProvider onNavigate={(path) => router.push(path)}>
      {children}
    </AuthProvider>
  );
}
