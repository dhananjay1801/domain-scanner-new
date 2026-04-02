'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Search, 
  ShieldAlert, 
  History, 
  UserCircle,
  X,
  Menu,
  ChevronRight,
  ChevronLeft,
  Shield,
  Users,
  LogIn,
  Globe,
  Settings
} from 'lucide-react';
import { Logo } from './Logo';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';

const ownerNavItems = [
  { id: 'assessment', label: 'Assessment', icon: <BarChart3 />, path: '/dashboard' },
  { id: 'new-scan', label: 'New Scan', icon: <Search />, path: '/' },
  { id: 'malware-scan', label: 'Malware Scan', icon: <ShieldAlert />, path: '/dashboard/malware-scan' },
  { id: 'scan-history', label: 'Scan History', icon: <History />, path: '/dashboard/scan-history' },
  { id: 'malware-scan-history', label: 'Malware Scan History', icon: <History />, path: '/dashboard/malware-scan-history' },
];

const memberNavItems = [
  { id: 'my-issues', label: 'My Issues', icon: <Shield />, path: '/dashboard/my-issues' },
];

const adminNavItems = [
  { id: 'telemetry', label: 'Telemetry', icon: <BarChart3 />, path: '/admin' },
  { id: 'operators', label: 'Operators', icon: <Users />, path: '/admin/users' },
  { id: 'assets', label: 'Assets', icon: <Globe />, path: '/admin/domains' },
  { id: 'settings', label: 'System Config', icon: <Settings />, path: '/admin/settings' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { user, isOwner, isMember, logout } = useAuth();
  const [isLogoHovered, setIsLogoHovered] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (isCollapsed) {
      setIsLogoHovered(true);
      hoverTimeoutRef.current = setTimeout(() => {
        setIsCollapsed(false);
        setIsLogoHovered(false);
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setIsLogoHovered(false);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    }
  };

  const userInitials = user
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const profilePath = '/dashboard/profile';

  const isAdminRoute = pathname.startsWith('/admin');
  const visibleNavItems = isAdminRoute ? adminNavItems : isOwner ? ownerNavItems : isMember ? memberNavItems : [];

  return (
    <aside 
      className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-[#0F172A] text-slate-300 flex flex-col fixed left-0 top-0 border-r border-slate-800/50 z-[100] transition-all duration-300 ease-in-out group`}
    >
      {/* Sidebar Header */}
      <div className={`p-6 flex items-center justify-between mb-8 overflow-hidden h-20`}>
        <div 
          className="relative flex items-center cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            if (isCollapsed) {
              setIsCollapsed(false);
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            }
          }}
        >
          {isCollapsed ? (
            <AnimatePresence mode="wait">
              {isLogoHovered ? (
                <motion.button
                  key="open-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg"
                >
                  <ChevronRight size={18} />
                </motion.button>
              ) : (
                <motion.div
                  key="small-logo"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Logo className="w-8 h-8 brightness-0 invert opacity-90" showOnlyIcon={true} />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <Logo className="w-auto h-7 brightness-0 invert opacity-90" />
          )}
        </div>

        {!isCollapsed && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.path || 
            (item.id === 'scan-history' && pathname === '/dashboard/report');
          
          return (
            <Link 
              key={item.id} 
              href={item.path}
              title={isCollapsed ? item.label : undefined}
              className={`group flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl transition-all duration-200 relative ${
                isActive 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className={`transition-colors duration-200 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
              </div>
              {!isCollapsed && (
                <span className="text-sm font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {!user && (
          <Link 
            href="/login"
            title={isCollapsed ? 'Login' : undefined}
            className={`group flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-4 py-3 rounded-xl transition-all duration-200 relative hover:bg-slate-800/50 hover:text-white`}
          >
            <div className="text-slate-500 group-hover:text-slate-400">
              <LogIn size={18} />
            </div>
            {!isCollapsed && (
              <span className="text-sm font-medium tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                Login
              </span>
            )}
          </Link>
        )}
      </nav>

      {/* Profile / Bottom Section */}
      <div className={`p-4 border-t border-slate-800/50 overflow-hidden`}>
        {user ? (
          <Link
            href={profilePath}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl hover:bg-slate-800/50 transition-all cursor-pointer`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold relative">
              {userInitials}
              {!isCollapsed && (
                <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0F172A] ${
                  isOwner ? 'bg-blue-500' : 'bg-purple-500'
                }`} />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                </div>
                <p className="text-[10px] text-slate-500 truncate">{isOwner ? 'Owner' : isMember ? 'Member' : 'User'}</p>
              </div>
            )}
          </Link>
        ) : (
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-xl`}>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-400 text-[10px] font-bold">
              <LogIn size={14} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-400 truncate">Not signed in</p>
                <p className="text-[10px] text-slate-600 truncate">Login to continue</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
