'use client'

import React, { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  ChevronRight,
  ArrowLeft,
  Globe,
  Shield,
  Zap,
  Search,
  Activity,
  Lock,
  MessageSquare,
  Database,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  UserPlus,
  ChevronDown,
  Trash2,
} from 'lucide-react';

import { submitForAnalyzer, type GeneratedScoreResponse, type VulnerabilityEntry } from '@/api/analyzer';
import { submitFix, VULN_NAME_TO_FIX_TYPE, CATEGORY_TO_FIX_CATEGORY } from '@/api/fix';
import { useAuth } from '@/context/AuthContext';
import { getScanAssignments, assignIssue, removeAssignment, getAcceptedMembers, type IssueAssignment } from '@/api/assignment';

// ─── All 10 security factor definitions ──────────────────────────────────────
const ALL_FACTORS: { id: string; icon: React.ReactNode }[] = [
  { id: 'Network Security',     icon: <Globe size={14} /> },
  { id: 'Application Security', icon: <Shield size={14} /> },
  { id: 'DNS Health',           icon: <Zap size={14} /> },
  { id: 'TLS Security',         icon: <Lock size={14} /> },
  // { id: 'Patching',             icon: <Activity size={14} /> },
  { id: 'IP Reputation',        icon: <Search size={14} /> },
  // { id: 'Cubit Score',          icon: <ShieldCheck size={14} /> },
  // { id: 'Hacker Chatter',       icon: <MessageSquare size={14} /> },
  // { id: 'Information Leak',     icon: <Database size={14} /> },
  // { id: 'Social Eng.',          icon: <Users size={14} /> },
];

interface SecurityFactor {
  id: string;
  count: number;
  score: number;
  icon: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

function SecurityReportContent() {
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain') || 'unknown.com';
  const scanId = searchParams.get('scan_id');
  const { isOwner, user } = useAuth();

  const [globalScore, setGlobalScore] = useState(0);
  const [activeFactor, setActiveFactor] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [isFixing, setIsFixing] = useState<string | null>(null);
  const [fixedIssues, setFixedIssues] = useState<number[]>([]);
  const [assignments, setAssignments] = useState<IssueAssignment[]>([]);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [assignError, setAssignError] = useState('');
  const members = isOwner ? getAcceptedMembers() : [];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scanId) {
      setAssignments(getScanAssignments(scanId));
    }
  }, [scanId, selectedIssue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAssignDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const mainRef = useRef<HTMLDivElement>(null);

  const [dynamicIssuesData, setDynamicIssuesData] = useState<Record<string, any[]>>({});
  const [dynamicSecurityFactors, setDynamicSecurityFactors] = useState<SecurityFactor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportError, setReportError] = useState<string | null>(null);
  const [totalSubdomains, setTotalSubdomains] = useState(0);
  const [scanDate, setScanDate] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning'; visible: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type, visible: true });
    toastTimer.current = setTimeout(() => {
      setToast(prev => prev ? { ...prev, visible: false } : null);
      setTimeout(() => setToast(null), 400);
    }, 5000);
  }, []);

  useEffect(() => {
    if (!scanId) {
      setIsLoading(false);
      setReportError('No scan_id provided. Please start a scan first.');
      return;
    }

    setIsLoading(true);
    submitForAnalyzer(scanId)
      .then((res) => {
        setGlobalScore(res.domain_score);
        
        const newIssuesData: Record<string, any[]> = {};
        const activeFactorCounts: Record<string, number> = {};
        const allSubdomains = new Set<string>();
        
        Object.entries(res.categorized_vulnerabilities || {}).forEach(([factorName, vulnerabilities]) => {
            const factorIssues: any[] = [];
            let factorIssueCount = 0;
            
            Object.entries(vulnerabilities as Record<string, VulnerabilityEntry[]>).forEach(([vulnName, targets]) => {
                const findingTargets = Array.isArray(targets) ? targets : [];
                if (findingTargets.length === 0) return;
                
                findingTargets.forEach((t) => {
                    if (t.subdomain) allSubdomains.add(t.subdomain);
                });
                
                const firstFinding = findingTargets[0];
                factorIssueCount++;
                
                factorIssues.push({
                    id: Math.floor(Math.random() * 1000000), 
                    title: vulnName,
                    severity: firstFinding.severity,
                    category: factorName,
                    desc: firstFinding.description || `Detected issue: ${vulnName}. Affects ${findingTargets.length} host(s).`,
                    remediation: firstFinding.remediation || 'Please review and apply security best practices.',
                    breachRisk: firstFinding.breach_risk || firstFinding.severity,
                    impact: firstFinding.impact || 5,
                    findings: findingTargets.map((t) => ({
                        status: 'Open',
                        target: t.subdomain || '—',
                        ip: t.ip || '—',
                        port: t.port != null ? t.port : (vulnName.includes('443') ? 443 : (vulnName.includes('80') ? 80 : null)),
                        severity: t.severity,
                        cvss: t.cvss || (t.abuse_score ? (t.abuse_score / 10).toFixed(1) : '—'),
                        abuse_score: t.abuse_score,
                        country: t.country,
                        usage_type: t.usage_type,
                        isp: t.isp,
                        observation: new Date().toLocaleDateString()
                    })).sort((a: any, b: any) => (b.abuse_score || 0) - (a.abuse_score || 0))
                });
            });

            if (factorIssues.length > 0) {
                newIssuesData[factorName] = factorIssues;
                activeFactorCounts[factorName] = factorIssueCount;
            }
        });

        const apiScores = res.category_scores || {};
        const newFactors: SecurityFactor[] = ALL_FACTORS.map(f => ({
          id: f.id,
          count: activeFactorCounts[f.id] || 0,
          score: apiScores[f.id] ?? 100,
          icon: f.icon,
        }));
        
        setTotalSubdomains(allSubdomains.size);
        setScanDate(new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }));
        setDynamicIssuesData(newIssuesData);
        setDynamicSecurityFactors(newFactors);
        
        const firstActive = Object.keys(newIssuesData)[0];
        if (firstActive) setActiveFactor(firstActive);
        
        setIsLoading(false);
      })
      .catch((err: Error) => {
        setReportError(err.message);
        setIsLoading(false);
      });
  }, [scanId]);

  useEffect(() => {
    if (scanId) {
      setAssignments(getScanAssignments(scanId));
    }
  }, [scanId, selectedIssue]);

  const handleAssignIssue = (memberId: string, memberName: string) => {
    if (!scanId || !selectedIssue) return;
    try {
      assignIssue(scanId, selectedIssue.title, memberId, memberName);
      setAssignments(getScanAssignments(scanId));
      setShowAssignDropdown(false);
      setAssignError('');
    } catch (err: any) {
      setAssignError(err.message);
    }
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    if (!scanId) return;
    removeAssignment(assignmentId, scanId);
    setAssignments(getScanAssignments(scanId));
  };

  const getAssignmentForIssue = (issueTitle: string) => {
    return assignments.find((a) => a.issueTitle === issueTitle);
  };


  // Counts
  const totalVulns = dynamicSecurityFactors.reduce((sum, f) => sum + f.count, 0);

  const [fixStatus, setFixStatus] = useState<Record<number, 'pending' | 'success' | 'failed'>>({});

  const handleFix = async (issueId: number, findingIndex?: number) => {
    // Find the issue object
    let targetIssue: any = null;
    for (const factorData of Object.values(dynamicIssuesData)) {
      const issue = factorData.find(i => i.id === issueId);
      if (issue) {
        targetIssue = issue;
        break;
      }
    }

    if (!targetIssue) return;

    const fixType = VULN_NAME_TO_FIX_TYPE[targetIssue.title];
    const category = CATEGORY_TO_FIX_CATEGORY[targetIssue.category];

    if (!fixType || !category) {
      console.warn("No fix mapping for", targetIssue.title, targetIssue.category);
      showToast(`Fix for "${targetIssue.title}" is not yet implemented.`, 'warning');
      return;
    }

    const fixKey = `${issueId}-${findingIndex ?? 0}`;
    setIsFixing(fixKey);
    setFixStatus(prev => ({ ...prev, [issueId]: 'pending' }));

    try {
      const index = findingIndex ?? 0;
      const finding = targetIssue.findings[index];

      await submitFix({
        scan_id: scanId!,
        domain: domain,
        fix_type: fixType,
        data: {
          category: category,
          subdomain: finding.target === '—' ? domain : finding.target,
          port: finding.port !== '—' && finding.port != null ? Number(finding.port) : null
        }
      });

      // Wait for the scanner to verify the fix (5-10 seconds for probe to complete)
      await new Promise(resolve => setTimeout(resolve, 8000));

      // Re-fetch the score to see if the issue was removed
      const updatedRes = await submitForAnalyzer(scanId!);

      // Check if the specific issue still exists in the updated response
      let issueStillExists = false;
      if (updatedRes.categorized_vulnerabilities) {
        for (const [, vulnerabilities] of Object.entries(updatedRes.categorized_vulnerabilities)) {
          const vulns = vulnerabilities as Record<string, any[]>;
          if (vulns[targetIssue.title]) {
            // Check if the specific subdomain finding still exists
            const subdomainToCheck = finding.target === '—' ? domain : finding.target;
            const stillHasFinding = vulns[targetIssue.title].some(
              (f: any) => f.subdomain === subdomainToCheck
            );
            if (stillHasFinding) {
              issueStillExists = true;
              break;
            }
          }
        }
      }

      if (!issueStillExists) {
        // Issue is resolved! Update the UI
        setFixStatus(prev => ({ ...prev, [issueId]: 'success' }));
        setFixedIssues(prev => [...prev, issueId]);
        setGlobalScore(updatedRes.domain_score);
        
        // Refresh the full data
        const newIssuesData: Record<string, any[]> = {};
        const activeFactorCounts: Record<string, number> = {};
        const allSubdomains = new Set<string>();
        
        Object.entries(updatedRes.categorized_vulnerabilities || {}).forEach(([factorName, vulnerabilities]) => {
          const factorIssues: any[] = [];
          let factorIssueCount = 0;
          
          Object.entries(vulnerabilities as Record<string, VulnerabilityEntry[]>).forEach(([vulnName, targets]) => {
            const findingTargets = Array.isArray(targets) ? targets : [];
            if (findingTargets.length === 0) return;
            
            findingTargets.forEach((t) => {
              if (t.subdomain) allSubdomains.add(t.subdomain);
            });
            
            const firstFinding = findingTargets[0];
            factorIssueCount++;
            
            factorIssues.push({
              id: Math.floor(Math.random() * 1000000), 
              title: vulnName,
              severity: firstFinding.severity,
              category: factorName,
              desc: firstFinding.description || `Detected issue: ${vulnName}. Affects ${findingTargets.length} host(s).`,
              remediation: firstFinding.remediation || 'Please review and apply security best practices.',
              breachRisk: firstFinding.breach_risk || firstFinding.severity,
              impact: firstFinding.impact || 5,
              findings: findingTargets.map((t) => ({
                status: 'Open',
                target: t.subdomain || '—',
                ip: t.ip || '—',
                port: t.port != null ? t.port : null,
                severity: t.severity,
                cvss: t.cvss || '—',
                abuse_score: t.abuse_score,
                country: t.country,
                usage_type: t.usage_type,
                isp: t.isp,
                observation: new Date().toLocaleDateString()
              }))
            });
          });

          if (factorIssues.length > 0) {
            newIssuesData[factorName] = factorIssues;
            activeFactorCounts[factorName] = factorIssueCount;
          }
        });

        const apiScores = updatedRes.category_scores || {};
        const newFactors: SecurityFactor[] = ALL_FACTORS.map(f => ({
          id: f.id,
          count: activeFactorCounts[f.id] || 0,
          score: apiScores[f.id] ?? 100,
          icon: f.icon,
        }));
        
        setTotalSubdomains(allSubdomains.size);
        setDynamicIssuesData(newIssuesData);
        setDynamicSecurityFactors(newFactors);

        showToast("Issue verified as resolved! Your security score has been updated.", 'success');
      } else {
        // Issue is NOT resolved
        setFixStatus(prev => ({ ...prev, [issueId]: 'failed' }));
        showToast("❌ Issue NOT resolved yet. Please fix the issue on your server/DNS and try again.", 'error');
      }

    } catch (err) {
      console.error("Fix failed:", err);
      setFixStatus(prev => ({ ...prev, [issueId]: 'failed' }));
      showToast("Failed to submit fix request. Please check your connection.", 'error');
    } finally {
      setIsFixing(null);
    }
  };


  useEffect(() => {
    if (isLoading || globalScore === 0) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.score-counter',
        { innerHTML: 0 },
        { innerHTML: globalScore, duration: 2, snap: { innerHTML: 1 }, ease: 'power2.out' }
      );
      gsap.fromTo('.factor-bar',
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.2, stagger: 0.1, ease: 'power2.out', delay: 0.8 }
      );
    }, mainRef);
    return () => ctx.revert();
  }, [isLoading, globalScore]);

  const factorIssues = (dynamicIssuesData[activeFactor] || []).filter(i => {
    if (fixedIssues.includes(i.id)) return false;
    if (!isOwner && user) {
      const memberAssignments = assignments.filter((a) => a.assignedToId === user.id);
      const assignedTitles = new Set(memberAssignments.map((a) => a.issueTitle));
      return assignedTitles.has(i.title);
    }
    return true;
  });

  // Score label
  const scoreLabel = globalScore >= 90 ? 'Excellent' : globalScore >= 75 ? 'Fair' : globalScore >= 60 ? 'Needs Work' : 'Critical';

  // ─── Loading State ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-[#f8fbff] gap-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-blue-600" />
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Generating Security Report</h2>
          <p className="text-sm text-slate-500 font-medium">Analyzing scan data for <span className="font-bold text-slate-700">{domain}</span></p>
        </div>
      </div>
    );
  }

  if (reportError) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-[#f8fbff] gap-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 border border-red-100">
          <AlertCircle size={32} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Report Error</h2>
          <p className="text-sm text-red-500 font-medium">{reportError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col gap-6 p-8 bg-[#f8fbff]" ref={mainRef}>

      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">{domain}</h1>
            <span className="px-2 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded border border-slate-800 uppercase tracking-tighter">Verified</span>
          </div>
          <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em]">
            Tier-1 Security Assessment — {totalSubdomains} Subdomains Scanned · Last run: {scanDate}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-5 py-2.5 border border-slate-200 text-[10px] font-black text-slate-600 bg-white hover:bg-slate-50 transition-all rounded-lg uppercase tracking-widest shadow-sm">
            Generate Report
          </button>
          <button className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black hover:bg-blue-700 transition-all flex items-center space-x-2 rounded-lg uppercase tracking-widest shadow-lg shadow-blue-500/20">
            <Clock className="w-3.5 h-3.5 stroke-[3]" />
            <span>Recalibrate Scan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Score Card */}
        <div className="xl:col-span-12 bg-white rounded-2xl p-10 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-16 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50/50 rounded-full -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-1000" />

          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="text-9xl font-black text-slate-900 score-counter leading-none tracking-tighter">{globalScore}</div>
              <div className={`absolute top-0 -right-16 px-2 py-0.5 text-[10px] font-black rounded border-2 border-white shadow-xl ${
                globalScore >= 75 ? 'bg-orange-500 text-white' : 'bg-red-600 text-white'
              }`}>
                {scoreLabel}
              </div>
            </div>
            <p className="text-[9px] font-black text-slate-400 mt-4 tracking-[0.4em] uppercase">Global Security Health Index</p>
          </div>

          <div className="flex-1 w-full space-y-10">
            <div className="space-y-5">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Score Progress</span>
                <span className="text-[10px] font-black text-blue-600 px-2 py-1 bg-blue-50 rounded uppercase tracking-tighter">Target 98%</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-sm overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${globalScore}%` }}
                  transition={{ duration: 1.5, ease: 'circOut' }}
                  className="h-full bg-slate-900 rounded-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Analysis Explorer */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Deep Analysis Explorer</h3>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Scan completed {scanDate} · {totalSubdomains} subdomains · {totalVulns} issues</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
          {/* Vertical Factor Sidebar */}
          <div className="lg:col-span-3 bg-slate-50/50 border-r border-slate-50 p-6 space-y-2 overflow-y-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Security Factors</p>
            {dynamicSecurityFactors.map((factor) => (
              <motion.button
                key={factor.id}
                onClick={() => {
                  setActiveFactor(factor.id);
                  setSelectedIssue(null);
                }}
                animate={{
                  backgroundColor: activeFactor === factor.id ? '#0f172a' : 'rgba(255, 255, 255, 1)',
                  borderColor: activeFactor === factor.id ? '#1e293b' : '#f1f5f9',
                  x: activeFactor === factor.id ? 4 : 0
                }}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative flex items-center justify-between p-4 rounded-xl border mb-2 overflow-hidden shadow-sm"
              >
                <AnimatePresence>
                  {activeFactor === factor.id && (
                    <motion.div
                      layoutId="active-indicator"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      exit={{ opacity: 0, scaleY: 0 }}
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 z-10"
                    />
                  )}
                </AnimatePresence>
                <div className="flex items-center space-x-3 relative z-20">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    activeFactor === factor.id ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                    {factor.icon}
                  </div>
                  <div className="text-left">
                    <motion.span
                      animate={{ color: activeFactor === factor.id ? '#ffffff' : '#0f172a' }}
                      className="block text-[11px] font-black tracking-tight"
                    >
                      {factor.id}
                    </motion.span>
                    <motion.span
                      animate={{ color: activeFactor === factor.id ? 'rgba(96,165,250,0.8)' : '#94a3b8' }}
                      className="text-[8.5px] font-black uppercase tracking-[0.1em]"
                    >
                      {factor.count > 0 ? `${factor.count} issue${factor.count > 1 ? 's' : ''} found` : 'No issues'}
                    </motion.span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 relative z-20">
                  <div className="flex items-center space-x-1">
                    <motion.span
                      animate={{ color: activeFactor === factor.id ? '#93c5fd' : '#0f172a' }}
                      className="text-[12px] font-black"
                    >
                      {factor.score}
                    </motion.span>
                    <span className={`text-[8px] font-bold ${activeFactor === factor.id ? 'text-slate-500' : 'text-slate-400'}`}>/100</span>
                  </div>
                  {factor.count > 0 && (
                    <div className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                      activeFactor === factor.id ? 'bg-blue-500/20 text-blue-400' : 'bg-red-50 text-red-500'
                    }`}>
                      {factor.count} {factor.count === 1 ? 'Vulnerability' : 'Vulnerabilities'}
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Issues List */}
          <div className="lg:col-span-9 p-8 bg-slate-50/20 relative">
            <AnimatePresence mode="wait">
              {!selectedIssue ? (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full"
                >
                  <div className="flex items-center justify-between mb-8 px-2">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Issues · {activeFactor}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{domain}</p>
                    </div>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Critical</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">High</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {factorIssues.length > 0 ? (
                      factorIssues.map((issue) => (
                        <div
                          key={issue.id}
                          onClick={() => setSelectedIssue(issue)}
                          className="group bg-white rounded-[24px] border border-slate-100 p-6 hover:shadow-lg hover:border-slate-200 transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-center space-x-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                                  issue.severity === 'Critical' ? 'bg-red-50 text-red-600 border border-red-100' :
                                  issue.severity === 'High'     ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                  issue.severity === 'Medium'   ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                                                                   'bg-blue-50 text-blue-600 border border-blue-100'
                                }`}>
                                  {issue.severity}
                                </span>
                                <h5 className="text-sm font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{issue.title}</h5>
                              </div>
                              <p className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-2xl line-clamp-2">{issue.desc}</p>
                              <div className="flex items-center space-x-2 pt-1">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Affected:</span>
                                <span className="text-[10px] font-bold text-blue-600">{issue.findings.length} {issue.findings.length === 1 ? 'host' : 'hosts'}</span>
                              </div>
                              {/* IP & Port badges */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                                {issue.findings.slice(0, 4).map((f: any, fi: number) => (
                                  <span key={fi} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-[9px] font-bold text-slate-500">
                                    <Globe size={9} className="text-slate-400" />
                                    <span className="font-mono">{f.ip !== '—' ? f.ip : f.target}</span>
                                    {f.port !== '—' && <span className="text-slate-300">:{f.port}</span>}
                                  </span>
                                ))}
                                {issue.findings.length > 4 && (
                                  <span className="text-[9px] font-black text-slate-400">+{issue.findings.length - 4} more</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 ml-4">
                              <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                <ChevronRight size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-500 border border-green-100">
                          <ShieldCheck size={32} />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-lg font-black text-slate-900 uppercase">Sector Secure</h5>
                          <p className="text-sm text-slate-400 font-medium">No active vulnerabilities detected in this sector.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  {/* Detail Header */}
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setSelectedIssue(null)}
                      className="flex items-center space-x-2 text-slate-400 hover:text-slate-900 transition-colors group mb-2"
                    >
                      <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{activeFactor}</span>
                    </button>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedIssue.title}</h3>
                  </div>

                  {/* Assignment Section (Owner Only) */}
                  {isOwner && (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users size={14} className="text-slate-400" />
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Assignment</p>
                        </div>
                        <div className="relative" ref={dropdownRef}>
                          <button
                            onClick={() => { setShowAssignDropdown(!showAssignDropdown); setAssignError(''); }}
                            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 hover:border-slate-300 transition-colors uppercase tracking-widest"
                          >
                            <UserPlus size={12} />
                            <span>Assign To</span>
                            <ChevronDown size={12} className={`transition-transform ${showAssignDropdown ? 'rotate-180' : ''}`} />
                          </button>

                          <AnimatePresence>
                            {showAssignDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
                              >
                                <div className="p-2">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Select Team Member</p>
                                  {members.length > 0 ? (
                                    members.map((member) => (
                                      <button
                                        key={member.id}
                                        onClick={() => handleAssignIssue(member.id, member.name)}
                                        className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
                                      >
                                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-[10px] font-black flex-shrink-0">
                                          {member.name[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                                          <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                                        </div>
                                      </button>
                                    ))
                                  ) : (
                                    <div className="px-3 py-4 text-center">
                                      <p className="text-xs text-slate-400 font-medium">No team members yet</p>
                                      <p className="text-[10px] text-slate-300 mt-1">Add members in Profile</p>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {assignError && (
                        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> {assignError}
                        </p>
                      )}

                      {/* Current Assignments */}
                      {(() => {
                        const currentAssignment = getAssignmentForIssue(selectedIssue.title);
                        if (currentAssignment) {
                          return (
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-black">
                                  {currentAssignment.assignedToName[0].toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{currentAssignment.assignedToName}</p>
                                  <p className="text-[10px] text-slate-400">Assigned {currentAssignment.createdAt}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveAssignment(currentAssignment.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                title="Remove assignment"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  {/* Member view: show who this is assigned to */}
                  {!isOwner && (() => {
                    const currentAssignment = getAssignmentForIssue(selectedIssue.title);
                    if (!currentAssignment) return null;
                    return (
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Assigned To You</p>
                        <p className="text-xs text-blue-700 font-medium">This issue has been assigned to you by the team owner.</p>
                      </div>
                    );
                  })()}

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Threat Level',  value: selectedIssue.severity,   sub: 'Expert Calibration' },
                      { label: 'Breach Risk',   value: selectedIssue.breachRisk, sub: 'Vector Likelihood' },
                    ].map((card, i) => (
                      <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-2 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{card.label}</p>
                        <p className={`text-xl font-black ${
                          card.value === 'Critical' ? 'text-red-500' :
                          card.value === 'High'     ? 'text-orange-500' :
                          card.value === 'Medium'   ? 'text-yellow-400' : 'text-white'
                        }`}>{card.value}</p>
                        <p className="text-[8px] text-slate-600 font-extrabold uppercase tracking-tighter">{card.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <div className="bg-white p-6 rounded-xl border border-slate-100 space-y-3 shadow-sm">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <AlertCircle size={14} className="stroke-[3]" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]">Vector Description</p>
                    </div>
                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed">{selectedIssue.desc}</p>
                  </div>

                  {/* Remediation */}
                  <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 space-y-3 shadow-2xl">
                    <div className="flex items-center space-x-2 text-blue-500">
                      <ShieldCheck size={14} className="stroke-[3]" />
                      <p className="text-[9px] font-black uppercase tracking-[0.2em]">Remediation Strategy</p>
                    </div>
                    <p className="text-[13px] text-slate-300 font-medium leading-relaxed">{selectedIssue.remediation}</p>
                  </div>

                  {/* Findings Table */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                      Findings ({selectedIssue.findings.length} hosts)
                    </h4>
                    <div className="bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 max-h-72 overflow-y-auto">
                      <table className="w-full text-left text-[11px]">
                        <thead className="sticky top-0 bg-slate-900">
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="px-6 py-4 font-black uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 font-black uppercase tracking-widest">Target</th>
                            <th className="px-6 py-4 font-black uppercase tracking-widest">IP Address</th>
                            <th className="px-6 py-4 font-black uppercase tracking-widest">{activeFactor === 'IP Reputation' ? 'Abuse Score' : 'Port'}</th>
                            <th className="px-6 py-4 font-black uppercase tracking-widest">{activeFactor === 'IP Reputation' ? 'Country' : 'CVSS'}</th>
                            <th className="px-6 py-4 font-black uppercase tracking-widest">Last Observed</th>
                            <th className="px-6 py-4 font-black uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-300">
                          {selectedIssue.findings.map((f: any, i: number) => (
                            <tr key={i} className="group hover:bg-white/5 transition-colors border-b border-slate-800/50 last:border-0">
                              <td className="px-6 py-4">
                                <span className="px-2 py-0.5 rounded-full border border-orange-500/30 text-orange-500 bg-orange-500/5 font-bold uppercase text-[9px]">
                                  {f.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-slate-400 text-[10px]">{f.target}</td>
                              <td className="px-6 py-4 font-mono text-blue-400 text-[10px]">{f.ip}</td>
                              <td className="px-6 py-4 font-bold">
                                {activeFactor === 'IP Reputation' ? (
                                  <span className={`px-2 py-0.5 rounded ${
                                    f.abuse_score > 50 ? 'bg-red-500/20 text-red-500' :
                                    f.abuse_score > 20 ? 'bg-orange-500/20 text-orange-500' :
                                    'bg-green-500/20 text-green-500'
                                  }`}>
                                    {f.abuse_score}%
                                  </span>
                                ) : f.port}
                              </td>
                              <td className="px-6 py-4 font-black text-white">
                                {activeFactor === 'IP Reputation' ? (
                                  <span className="flex items-center space-x-1.5 font-bold text-slate-400">
                                    <span className="text-[10px]">{f.country || '—'}</span>
                                  </span>
                                ) : f.cvss}
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-medium uppercase text-[10px]">{f.observation}</td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleFix(selectedIssue.id, i)}
                                  disabled={isFixing === `${selectedIssue.id}-${i}`}
                                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all inline-flex items-center space-x-2 ${
                                    isFixing === `${selectedIssue.id}-${i}`
                                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 shadow-sm'
                                  }`}
                                >
                                  {isFixing === `${selectedIssue.id}-${i}` ? (
                                    <><div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /><span>Verifying...</span></>
                                  ) : (
                                    <><ShieldCheck size={12} /><span>Fix</span></>
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: toast.visible ? 1 : 0, y: toast.visible ? 0 : -20, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 20 }}
            className="fixed top-6 right-6 z-[9999] max-w-md"
          >
            <div className={`flex items-start gap-3 px-5 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
                : toast.type === 'error'
                ? 'bg-red-950/90 border-red-500/30 text-red-100'
                : 'bg-amber-950/90 border-amber-500/30 text-amber-100'
            }`}>
              <div className={`mt-0.5 flex-shrink-0 ${
                toast.type === 'success' ? 'text-emerald-400' :
                toast.type === 'error' ? 'text-red-400' : 'text-amber-400'
              }`}>
                {toast.type === 'success' ? <CheckCircle2 size={20} /> :
                 toast.type === 'error' ? <XCircle size={20} /> :
                 <AlertTriangle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">
                  {toast.type === 'success' ? 'Verification Passed' :
                   toast.type === 'error' ? 'Verification Failed' : 'Notice'}
                </p>
                <p className="text-[13px] font-semibold leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => {
                  if (toastTimer.current) clearTimeout(toastTimer.current);
                  setToast(prev => prev ? { ...prev, visible: false } : null);
                  setTimeout(() => setToast(null), 400);
                }}
                className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Suspend Wrapper ────────────────────────────────────────────────────────


export default function SecurityReport() {
  return (
    <Suspense fallback={<div className="min-h-full flex items-center justify-center bg-[#f8fbff] text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Report...</div>}>
      <SecurityReportContent />
    </Suspense>
  );
}
