import { getTeamMembers, type TeamMember } from './team';

export interface IssueAssignment {
  id: string;
  scanId: string;
  issueTitle: string;
  assignedToId: string;
  assignedToName: string;
  assignedBy: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
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

function getAssignmentsKey(scanId: string): string {
  const ownerId = getOwnerId();
  return `assignments_${ownerId}_${scanId}`;
}

export function getScanAssignments(scanId: string): IssueAssignment[] {
  const key = getAssignmentsKey(scanId);
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function assignIssue(scanId: string, issueTitle: string, assignedToId: string, assignedToName: string): IssueAssignment {
  const key = getAssignmentsKey(scanId);
  const assignments: IssueAssignment[] = JSON.parse(localStorage.getItem(key) || '[]');

  const existing = assignments.find((a) => a.issueTitle === issueTitle && a.assignedToId === assignedToId);
  if (existing) {
    throw new Error('This issue is already assigned to this member.');
  }

  const newAssignment: IssueAssignment = {
    id: generateId(),
    scanId,
    issueTitle,
    assignedToId,
    assignedToName,
    assignedBy: getOwnerId(),
    status: 'open',
    createdAt: new Date().toLocaleDateString(),
  };

  assignments.push(newAssignment);
  localStorage.setItem(key, JSON.stringify(assignments));

  return newAssignment;
}

export function removeAssignment(assignmentId: string, scanId: string) {
  const key = getAssignmentsKey(scanId);
  const assignments: IssueAssignment[] = JSON.parse(localStorage.getItem(key) || '[]');
  const filtered = assignments.filter((a) => a.id !== assignmentId);
  localStorage.setItem(key, JSON.stringify(filtered));
}

export function getMemberIssues(memberId: string): IssueAssignment[] {
  const allKeys = Object.keys(localStorage).filter((k) => k.startsWith('assignments_'));
  const issues: IssueAssignment[] = [];

  for (const key of allKeys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) {
        issues.push(...data.filter((a: IssueAssignment) => a.assignedToId === memberId));
      }
    } catch {
      continue;
    }
  }

  return issues;
}

export function getAcceptedMembers(): TeamMember[] {
  return getTeamMembers().filter((m) => m.status === 'accepted');
}

export function updateAssignmentStatus(assignmentId: string, scanId: string, status: 'open' | 'in_progress' | 'resolved') {
  const key = getAssignmentsKey(scanId);
  const assignments: IssueAssignment[] = JSON.parse(localStorage.getItem(key) || '[]');
  const idx = assignments.findIndex((a) => a.id === assignmentId);
  if (idx !== -1) {
    assignments[idx].status = status;
    localStorage.setItem(key, JSON.stringify(assignments));
  }
}
