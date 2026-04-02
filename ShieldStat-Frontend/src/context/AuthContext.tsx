'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/auth';

export type UserRole = 'owner' | 'member';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  domain: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, domain: string) => Promise<void>;
  logout: () => void;
  isOwner: boolean;
  isMember: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children, onNavigate }: { children: React.ReactNode; onNavigate?: (path: string) => void }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
    setIsHydrated(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const authUser: AuthUser = {
      id: response.user_id,
      name: response.name,
      email: response.email,
      domain: response.domain,
      role: 'owner',
    };
    localStorage.setItem('token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    setUser(authUser);
    onNavigate?.('/dashboard');
  }, [onNavigate]);

  const register = useCallback(async (name: string, email: string, password: string, domain: string) => {
    await authApi.register(name, email, password, domain);
    const loginResponse = await authApi.login(email, password);
    const authUser: AuthUser = {
      id: loginResponse.user_id,
      name: loginResponse.name,
      email: loginResponse.email,
      domain: loginResponse.domain,
      role: 'owner',
    };
    localStorage.setItem('token', loginResponse.token);
    localStorage.setItem('auth_user', JSON.stringify(authUser));
    setUser(authUser);
    onNavigate?.('/dashboard');
  }, [onNavigate]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('token');
    onNavigate?.('/login');
  }, [onNavigate]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isOwner: user?.role === 'owner', isMember: user?.role === 'member' }}>
      {children}
    </AuthContext.Provider>
  );
}
