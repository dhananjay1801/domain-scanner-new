import { type AuthUser } from '@/context/AuthContext';

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'accepted' | 'revoked';
  invitedAt: string;
  acceptedAt?: string;
  invitationToken: string;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getOwnerId(): string {
  const stored = localStorage.getItem('auth_user');
  if (!stored) return '';
  try {
    return JSON.parse(stored).id;
  } catch {
    return '';
  }
}

export function getTeamMembers(): TeamMember[] {
  const ownerId = getOwnerId();
  const key = `team_${ownerId}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function inviteMember(email: string): { member: TeamMember; inviteLink: string } {
  const ownerId = getOwnerId();
  const key = `team_${ownerId}`;
  const members: TeamMember[] = JSON.parse(localStorage.getItem(key) || '[]');

  if (members.find((m) => m.email === email && m.status !== 'revoked')) {
    throw new Error('This email is already invited or is an active member.');
  }

  const token = generateToken();
  const owner = JSON.parse(localStorage.getItem('auth_user') || '{}');

  const newMember: TeamMember = {
    id: generateId(),
    email,
    name: email.split('@')[0],
    status: 'pending',
    invitedAt: new Date().toLocaleDateString(),
    invitationToken: token,
  };

  members.push(newMember);
  localStorage.setItem(key, JSON.stringify(members));

  const inviteLink = `${window.location.origin}/invite/?token=${token}`;

  return { member: newMember, inviteLink };
}

export function revokeMember(memberId: string) {
  const ownerId = getOwnerId();
  const key = `team_${ownerId}`;
  const members: TeamMember[] = JSON.parse(localStorage.getItem(key) || '[]');
  const idx = members.findIndex((m) => m.id === memberId);
  if (idx !== -1) {
    members[idx].status = 'revoked';
    localStorage.setItem(key, JSON.stringify(members));
  }
}

export function acceptInvitation(token: string): { success: boolean; user?: AuthUser } {
  const allKeys = Object.keys(localStorage).filter((k) => k.startsWith('team_'));

  for (const key of allKeys) {
    const members: TeamMember[] = JSON.parse(localStorage.getItem(key) || '[]');
    const member = members.find((m) => m.invitationToken === token && m.status === 'pending');

    if (member) {
      member.status = 'accepted';
      member.acceptedAt = new Date().toLocaleDateString();
      localStorage.setItem(key, JSON.stringify(members));

      const ownerKey = key.replace('team_', '');
      const users: AuthUser[] = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const owner = users.find((u) => u.id === ownerKey);

      const memberUser: AuthUser = {
        id: generateId(),
        name: member.name,
        email: member.email,
        domain: owner?.domain || '',
        role: 'member',
      };

      users.push(memberUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      localStorage.setItem('auth_user', JSON.stringify(memberUser));
      localStorage.setItem('token', 'mock_token_' + memberUser.id);

      return { success: true, user: memberUser };
    }
  }

  throw new Error('Invalid or expired invitation link.');
}

export function getInvitationByToken(token: string): { member: TeamMember; ownerName: string } | null {
  const allKeys = Object.keys(localStorage).filter((k) => k.startsWith('team_'));

  for (const key of allKeys) {
    const members: TeamMember[] = JSON.parse(localStorage.getItem(key) || '[]');
    const member = members.find((m) => m.invitationToken === token);

    if (member) {
      const ownerKey = key.replace('team_', '');
      const users: AuthUser[] = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const owner = users.find((u) => u.id === ownerKey);
      return { member, ownerName: owner?.name || 'Team Owner' };
    }
  }

  return null;
}
