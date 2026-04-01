import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider } from '@/context/SidebarContext';
import { MainLayout } from '@/components/MainLayout';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'ShieldStat - Professional Security Analysis',
  description: 'Real-time threat monitoring and professional risk analysis by ShieldStat',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`h-full bg-[#fcfcfc] text-slate-900 antialiased font-sans`} suppressHydrationWarning>
        <Providers>
          <SidebarProvider>
            <MainLayout>
              {children}
            </MainLayout>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
