'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Shield,
  Check,
  X,
  AlertCircle,
  Mail,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { getInvitationByToken, acceptInvitation, type TeamMember } from '@/api/team';
import { useAuth, type AuthUser } from '@/context/AuthContext';

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const token = searchParams.get('token');

  const [invitation, setInvitation] = useState<{ member: TeamMember; ownerName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('This invitation link is invalid or has expired.');
      setLoading(false);
      return;
    }
    const result = getInvitationByToken(token);
    if (result) {
      setInvitation(result);
    } else {
      setError('This invitation link is invalid or has expired.');
    }
    setLoading(false);
  }, [token]);

  const handleAccept = () => {
    if (!token) return;
    setAccepting(true);
    try {
      const result = acceptInvitation(token);
      if (result.success && result.user) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium mt-4">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff] p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase">Invalid Invitation</h2>
          <p className="text-sm text-slate-500 font-medium mt-2">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 w-full px-4 py-3 bg-slate-900 text-white text-[10px] font-black hover:bg-slate-800 rounded-xl uppercase tracking-widest transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fbff] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl border border-slate-100"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">You're Invited!</h1>
          <p className="text-sm text-slate-500 font-medium mt-2">
            <span className="font-bold text-slate-700">{invitation.ownerName}</span> has invited you to join their security scanning team.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-slate-400" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invited Email</p>
              <p className="text-sm font-bold text-slate-900">{invitation.member.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
          <p className="text-xs text-blue-700 font-medium">
            As a team member, you'll be able to view scan reports and issues assigned to you. The team owner retains full control over scans and issue management.
          </p>
        </div>

        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full px-4 py-3 bg-blue-600 text-white text-[10px] font-black hover:bg-blue-700 rounded-xl uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {accepting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Accepting...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Accept Invitation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <button
          onClick={() => router.push('/login')}
          className="w-full mt-3 px-4 py-3 border border-slate-200 text-[10px] font-black text-slate-600 hover:bg-slate-50 rounded-xl uppercase tracking-widest transition-colors"
        >
          Maybe Later
        </button>
      </motion.div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 font-medium mt-4">Loading invitation...</p>
        </div>
      </div>
    }>
      <InviteContent />
    </Suspense>
  );
}
