'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Mail,
  Copy,
  Check,
  X,
  Shield,
  Users,
  Clock,
  AlertCircle,
  User,
  LogOut,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getTeamMembers, inviteMember, revokeMember, type TeamMember } from '@/api/team';

export default function ProfilePage() {
  const { user, logout, isOwner } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState<{ member: TeamMember; inviteLink: string } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOwner) {
      setMembers(getTeamMembers());
    }
  }, [isOwner]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInvite = () => {
    setInviteError('');
    if (!inviteEmail.trim()) {
      setInviteError('Please enter an email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) {
      setInviteError('Please enter a valid email address.');
      return;
    }
    try {
      const result = inviteMember(inviteEmail);
      setInviteSuccess(result);
      setMembers(getTeamMembers());
      setInviteEmail('');
      showToast('Invitation sent successfully!');
    } catch (err: any) {
      setInviteError(err.message);
    }
  };

  const handleRevoke = (memberId: string) => {
    revokeMember(memberId);
    setMembers(getTeamMembers());
    showToast('Member access revoked.', 'error');
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      showToast('Link copied to clipboard!');
    } catch {
      showToast('Failed to copy link.', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-full flex flex-col gap-6 p-8 bg-[#f8fbff]">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Profile & Team</h1>
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Manage your account and team members</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-2 px-5 py-2.5 border border-red-200 text-[10px] font-black text-red-600 bg-white hover:bg-red-50 transition-all rounded-lg uppercase tracking-widest shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black">
            {user.email.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.email}</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                isOwner ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-purple-100 text-purple-700 border border-purple-200'
              }`}>
                {isOwner ? 'Owner' : 'Member'}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Owner-only: Team Management */}
      {isOwner && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Team Members</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{members.length} member{members.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => { setShowInviteModal(true); setInviteSuccess(null); setInviteError(''); }}
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black hover:bg-blue-700 transition-all rounded-lg uppercase tracking-widest shadow-lg shadow-blue-500/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          {/* Members List */}
          <div className="divide-y divide-slate-50">
            {members.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-sm font-black text-slate-900 uppercase">No team members yet</h4>
                <p className="text-xs text-slate-400 font-medium mt-1">Click "Add Member" to invite someone to your team.</p>
              </div>
            ) : (
              members.map((member) => (
                <div key={member.id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
                      member.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      member.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {member.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{member.email}</p>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          member.status === 'accepted' ? 'bg-green-50 text-green-600 border border-green-100' :
                          member.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-red-50 text-red-600 border border-red-100'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Invited {member.invitedAt}
                        </span>
                        {member.acceptedAt && (
                          <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Accepted {member.acceptedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.status === 'pending' && (
                      <button
                        onClick={() => copyLink(`${window.location.origin}/invite/?token=${member.invitationToken}`)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Copy invite link"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <LinkIcon className="w-4 h-4" />}
                      </button>
                    )}
                    {member.status !== 'revoked' && (
                      <button
                        onClick={() => handleRevoke(member.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Revoke access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Member-only: Assigned Issues Info */}
      {!isOwner && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">Your Access</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Read-only access to assigned issues</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            You can view scan reports and issues assigned to you by the team owner. Check the sidebar for your assigned issues.
          </p>
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Invite Team Member</h3>
                <button onClick={() => setShowInviteModal(false)} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {!inviteSuccess ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                          placeholder="member@example.com"
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                      {inviteError && (
                        <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {inviteError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 px-4 py-3 border border-slate-200 text-[10px] font-black text-slate-600 hover:bg-slate-50 rounded-xl uppercase tracking-widest transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleInvite}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white text-[10px] font-black hover:bg-blue-700 rounded-xl uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20"
                    >
                      Send Invitation
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                    <p className="text-sm font-bold text-green-700">Invitation created for <span className="font-black">{inviteSuccess.member.email}</span></p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Share this invite link</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 truncate">
                        {inviteSuccess.inviteLink}
                      </div>
                      <button
                        onClick={() => copyLink(inviteSuccess.inviteLink)}
                        className="px-4 py-2.5 bg-blue-600 text-white text-[10px] font-black hover:bg-blue-700 rounded-xl uppercase tracking-widest transition-colors flex items-center gap-2"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedLink ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-medium">
                    Share this link with the member. They can click it to accept the invitation and join your team.
                  </p>

                  <button
                    onClick={() => { setShowInviteModal(false); setInviteSuccess(null); }}
                    className="w-full px-4 py-3 bg-slate-900 text-white text-[10px] font-black hover:bg-slate-800 rounded-xl uppercase tracking-widest transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className={`fixed top-6 right-6 z-[9999] max-w-md px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
                : 'bg-red-950/90 border-red-500/30 text-red-100'
            }`}
          >
            <p className="text-[13px] font-semibold">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
