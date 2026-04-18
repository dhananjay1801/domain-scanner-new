import React, { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ASSESSMENT_CATEGORIES,
  getInitialSelections,
  getMetricColor,
  getMetricTextColor,
  getRadarPoint,
} from "../utils/assessmentUtils";
import { getScore, getMalwareReport, getProfile } from "../services/api";
import { 
  FileText, Link2, Globe, Zap, ShieldAlert, CheckCircle2, 
  Bug, ShieldCheck, ArrowRight, Shield, AlertTriangle, 
  Search, AlertCircle, Ban, Activity, Cpu, Layers, 
  Clock, HardDrive, XCircle, MousePointer2 
} from "lucide-react";

function normalizeDomain(domain) {
  return (domain || "").trim();
}

function normalizeProfileDomains(domainValue) {
  if (Array.isArray(domainValue)) {
    return domainValue.map(normalizeDomain).filter(Boolean);
  }
  const normalizedDomain = normalizeDomain(domainValue);
  return normalizedDomain ? [normalizedDomain] : [];
}

function dedupeDomains(domains) {
  const seen = new Set();
  return domains.filter((domain) => {
    const d = normalizeDomain(domain).toLowerCase();
    if (!d || seen.has(d)) return false;
    seen.add(d);
    return true;
  });
}

function StatCard({ label, value, icon: Icon, colorClass = "bg-rose-50 text-rose-600", borderClass = "border-rose-100" }) {
  return (
    <div className={`${colorClass} ${borderClass} border rounded-xl p-3 flex items-center gap-3 transition-all hover:scale-[1.02] shadow-sm`}>
      <div className="w-8 h-8 rounded-lg bg-white/50 backdrop-blur-sm flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-0.5">{label}</div>
        <div className="text-sm font-black leading-tight">{value}</div>
      </div>
    </div>
  );
}

function extractMalwareSummary(report) {
  if (!report) return null;
  const rawFiles = Array.isArray(report.files) ? report.files : [];
  const maliciousCount = rawFiles.filter(f => (f.threat || "").toLowerCase().includes("malicious") || (f._severity || "").toLowerCase() === "critical").length;
  const suspiciousCount = rawFiles.filter(f => (f.threat || "").toLowerCase().includes("suspicious") || (f._severity || "").toLowerCase() === "high").length;
  const totalFiles = report.total_files ?? rawFiles.length;
  const cleanFiles = totalFiles - maliciousCount - suspiciousCount;
  const linkUrls = Object.keys(report.links || {});
  const domainEntries = Object.keys(report.domains || {});
  
  return {
    totalFiles,
    cleanFiles,
    maliciousCount,
    suspiciousCount,
    linksCount: report.links_count ?? linkUrls.length,
    domainsCount: report.domains_count ?? domainEntries.length,
    alertsCount: Array.isArray(report.alerts) ? report.alerts.length : 0,
    blacklistCount: Array.isArray(report.blacklist?.providers) ? report.blacklist.providers.length : 0,
    isInfected: maliciousCount > 0,
    timestr: report.timestr || "—"
  };
}

function DomainTab({ domain, isActive, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition-all active:scale-95 ${
        isActive
          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
      }`}
    >
      <span
        className="material-symbols-outlined text-base"
        style={isActive ? { fontVariationSettings: `"FILL" 1` } : undefined}
      >
        language
      </span>
      <span className="max-w-[220px] truncate">{domain}</span>
    </button>
  );
}

function ScanDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [knownDomains, setKnownDomains] = useState([]);
  
  const domainParam = searchParams.get("domain");
  const domain = normalizeDomain(domainParam || knownDomains[0] || "");
  
  const [data, setData] = useState(null);
  const [malware, setMalware] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile and default domain
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    getProfile(token).then((profile) => {
      const profileDomains = dedupeDomains(normalizeProfileDomains(profile?.domain));
      setKnownDomains(profileDomains);
      
      if (!domainParam && profileDomains.length > 0) {
        setSearchParams({ domain: profileDomains[0] }, { replace: true });
      }
    }).catch(() => {});
  }, [domainParam, setSearchParams]);

  // Load scan data
  useEffect(() => {
    if (!domain) {
       setLoading(false);
       return;
    }
    
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    Promise.all([
      getScore(domain, token).catch(() => null),
      getMalwareReport(domain, token).catch(() => null)
    ]).then(([scoreData, malwareData]) => {
      setData(scoreData);
      setMalware(malwareData);
      setLoading(false);
    });
  }, [domain]);

  // ORIGINAL ASSESSMENT METRICS - KEEP THE OLD MOCK FOR ASSESSMENT CARD
  const metrics = useMemo(() => {
    const selections = getInitialSelections();
    return ASSESSMENT_CATEGORIES.map((category) => {
      const selectedCount = category.items.filter(
        (item) => selections[category.id]?.[item.id],
      ).length;
      const value = Math.round((selectedCount / category.items.length) * 100);

      return {
        ...category,
        selectedCount,
        value,
      };
    });
  }, []);

  const radarPoints = useMemo(() => {
    if (metrics.length < 4) return "";
    const [network, application, dns, endpoint] = metrics;
    return [
      getRadarPoint(network.value, "top"),
      getRadarPoint(application.value, "right"),
      getRadarPoint(dns.value, "bottom"),
      getRadarPoint(endpoint.value, "left"),
    ].join(" ");
  }, [metrics]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-indigo-500 animate-spin" style={{ animationDuration: "2s" }}>progress_activity</span>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">Loading profile and scan data…</p>
        </div>
      </div>
    );
  }

  // Derived real data
  const score = data?.domain_score ?? 0;
  
  let grade = { label: "At Risk", color: "text-red-600", bg: "bg-red-600" };
  if (score >= 80) grade = { label: "Optimal", color: "text-emerald-600", bg: "bg-emerald-600" };
  else if (score >= 60) grade = { label: "Fair", color: "text-amber-600", bg: "bg-amber-600" };
  else if (score >= 40) grade = { label: "Moderate", color: "text-orange-600", bg: "bg-orange-600" };

  // Find the IP of the root domain (not just any subdomain)
  const rootDomainLabel = (data?.host?.domain || domain || "").toLowerCase();
  let rootIp = null;
  if (data?.categorized_vulnerabilities) {
    outer: for (const rules of Object.values(data.categorized_vulnerabilities)) {
      for (const hosts of Object.values(rules || {})) {
        if (!Array.isArray(hosts)) continue;
        for (const h of hosts) {
          if (h.subdomain?.toLowerCase() === rootDomainLabel && h.ip) {
            rootIp = h.ip;
            break outer;
          }
        }
      }
    }
  }
  const primaryIp = rootIp || data?.ips?.[0] || "Unknown";
  const domainName = data?.host?.domain || domain || "No Domain Selected";
  
  // Calculate malware summary
  const mw = extractMalwareSummary(malware?.report);

  return (
    <div className="min-h-screen bg-surface relative">
      <main className="flex-1 overflow-y-auto pt-8 pb-16 px-12 max-w-[1600px] mx-auto w-full">
        
        {/* ── Domain nav ── */}
        {knownDomains.length > 0 && (
          <section className="mb-6">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h3 className="text-sm uppercase tracking-widest text-on-surface-variant font-bold">Your Domains</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {knownDomains.map((knownDomain) => (
                <DomainTab
                  key={knownDomain}
                  domain={knownDomain}
                  isActive={knownDomain.toLowerCase() === domain.toLowerCase()}
                  onClick={() => setSearchParams({ domain: knownDomain })}
                />
              ))}
            </div>
          </section>
        )}

        <header className="mb-8">
          <h1 className="text-3xl font-extrabold font-headline tracking-tight text-on-surface">
            Security Overview
          </h1>
          <p className="text-on-surface-variant text-sm mt-2">
            Comprehensive security posture across all scanning vectors for <strong className="text-slate-800">{domainName}</strong>.
          </p>
        </header>

        <section className="flex flex-col gap-6 mb-12">
          
          {/* 1. Assessment Overview Card (Uses Original Static Mock) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col xl:flex-row items-center xl:items-stretch gap-8 relative">
            
            {/* Left: Spider Net */}
            <div className="w-full xl:w-64 shrink-0 border border-slate-100 rounded-xl p-5 flex flex-col items-center justify-center bg-slate-50/50">
              <div className="w-full flex items-center justify-center xl:justify-start gap-2 mb-2">
                <span className="material-symbols-outlined text-indigo-600 text-lg">assignment_turned_in</span>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Spider Net Graph
                </h2>
              </div>
              <div className="relative flex aspect-square w-full max-w-[150px] items-center justify-center">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                  {metrics[0].axisLabel}
                </div>
                <div className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                  {metrics[1].axisLabel}
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                  {metrics[2].axisLabel}
                </div>
                <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                  {metrics[3].axisLabel}
                </div>

                <svg className="h-full w-full" viewBox="0 0 400 400">
                  <polygon points="200,40 360,200 200,360 40,200" fill="none" stroke="#e2e8f0" strokeDasharray="4" />
                  <polygon points="200,80 320,200 200,320 80,200" fill="none" stroke="#e2e8f0" strokeDasharray="4" />
                  <polygon points="200,120 280,200 200,280 120,200" fill="none" stroke="#e2e8f0" strokeDasharray="4" />
                  <polygon points="200,160 240,200 200,240 160,200" fill="none" stroke="#e2e8f0" strokeDasharray="4" />
                  <line x1="200" y1="40" x2="200" y2="360" stroke="#e2e8f0" />
                  <line x1="40" y1="200" x2="360" y2="200" stroke="#e2e8f0" />

                  <polygon
                    points={radarPoints}
                    fill="rgba(79,70,229,0.15)"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                  />

                  {radarPoints.split(" ").map((point, index) => {
                    const [cx, cy] = point.split(",");
                    const value = metrics[index].value;
                    const fill = value >= 55 ? "#4f46e5" : "#e11d48";
                    return <circle key={metrics[index].id} cx={cx} cy={cy} r="5" fill={fill} />;
                  })}
                </svg>
              </div>
            </div>

            {/* Middle: Metric Breakdown */}
            <div className="flex-1 w-full flex flex-col justify-center py-2">
              <div className="inline-flex items-center gap-2 px-0 py-1 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-4">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" /> 
                Assessment Control Domains
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                {metrics.map((metric) => (
                  <div key={metric.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-600 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-slate-400">{metric.icon}</span>
                        {metric.label}
                      </span>
                      <span className={`font-black text-xs ${getMetricTextColor(metric.value)}`}>
                        {metric.value}%
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${getMetricColor(metric.value)}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right: Full Info Button */}
            <div className="shrink-0 w-full xl:w-auto flex items-center mt-6 xl:mt-0 justify-center">
              <Link to="/assessment" className="px-8 py-3 bg-slate-50 hover:bg-slate-100 text-indigo-600 text-sm font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 w-full xl:w-auto">
                Full Info <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* 2. Regular Scan Card (Horizontal) */}
          {!data ? (
             <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 flex flex-col items-center justify-center relative text-center">
               <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">radar</span>
               <h3 className="text-xl font-bold text-slate-800">Scan Required</h3>
               <p className="text-slate-500 text-sm mt-1 max-w-sm">We couldn't find any vulnerability scan records for <span className="font-bold">{domainName}</span>.</p>
               <Link to="/scan" className="mt-5 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm">
                 Initiate Domain Scan
               </Link>
             </div>
          ) : (
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch gap-8 relative">
               <div className="md:w-64 shrink-0 border border-slate-100 rounded-xl p-5 flex flex-col justify-between">
                 <div>
                   <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security Grade</span>
                     <span className={`material-symbols-outlined ${grade.color} text-sm`} style={{ fontVariationSettings: `"FILL" 1` }}>
                       {score >= 60 ? "verified_user" : "warning"}
                     </span>
                   </div>
                   <div className="flex items-baseline gap-1 mb-2">
                     <h2 className={`text-5xl font-extrabold font-headline tracking-tighter ${grade.color}`}>{score}</h2>
                     <span className="text-lg text-slate-400 font-medium">/100</span>
                   </div>
                 </div>
                 <div className="mt-4">
                   <div className="flex-grow h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                     <div className={`h-full ${grade.bg} rounded-full`} style={{ width: `${score}%` }} />
                   </div>
                   <div className="text-right">
                     <span className={`font-bold font-headline uppercase tracking-widest text-[10px] ${grade.color}`}>{grade.label}</span>
                   </div>
                 </div>
               </div>

               <div className="flex-1 flex flex-col justify-center py-2">
                 <div className="inline-flex items-center gap-2 px-0 py-1 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-1">
                   <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" /> 
                   Active Scan Result
                 </div>
                 <h3 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-slate-900 mb-6 truncate" title={domainName}>
                   {domainName}
                 </h3>

                 <div className="flex flex-wrap gap-x-12 gap-y-6">
                   <div className="flex flex-col">
                     <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 border-b border-slate-100 pb-1">IP Address</span>
                     <span className="text-sm font-semibold text-slate-800">{primaryIp}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 border-b border-slate-100 pb-1">Total Findings</span>
                     <span className="text-sm font-semibold text-slate-800">
                        {data?.categorized_vulnerabilities 
                           ? Object.values(data.categorized_vulnerabilities).reduce((acc, cat) => acc + Object.keys(cat).length, 0)
                           : 0}
                     </span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1 border-b border-slate-100 pb-1">Last Updated</span>
                     <span className="text-sm font-semibold text-slate-800">Today</span>
                   </div>
                 </div>
               </div>
               
               <div className="shrink-0 flex items-center mt-6 md:mt-0 justify-center">
                 <Link to={`/scan-details?domain=${encodeURIComponent(domain)}`} className="px-8 py-3 bg-slate-50 hover:bg-slate-100 text-indigo-700 text-sm font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
                   Detailed Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
                 </Link>
               </div>
             </div>
          )}

          {/* 3. Malware Scan Card (Horizontal) */}
          {!mw ? (
            <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-200 flex flex-col items-center justify-center relative text-center">
              <Bug size={48} className="text-slate-300 mb-3" />
              <h3 className="text-xl font-bold text-slate-800">No Malware Data Logs</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm">This domain hasn't been scanned for malware endpoints yet.</p>
              <Link to="/malware" className="mt-5 px-6 py-2.5 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition shadow-sm">
                Initiate Malware Scan
              </Link>
             </div>
          ) : (
             <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch gap-8 relative overflow-hidden">
               {/* Decorative background accent */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

               <div className="flex-1 flex flex-col justify-center py-2 z-10">
                  <div className="inline-flex items-center gap-8 text-rose-600 text-[10px] font-bold uppercase tracking-widest mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-rose-600 rounded-full" /> 
                      Malware Analytics Summary
                    </div>
                    <span className="opacity-70">| &nbsp; Last Scan: {mw.timestr}</span>
                  </div>
                 
                 <h3 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight text-slate-900 mb-6 truncate" title={domainName}>
                   {domainName}
                 </h3>
                 
                 <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                    <StatCard label="Total Files" value={mw.totalFiles} icon={FileText} />
                    <StatCard label="Total Links" value={mw.linksCount} icon={Link2} colorClass="bg-blue-50 text-blue-600" borderClass="border-blue-100" />
                    <StatCard label="Domains" value={mw.domainsCount} icon={Globe} colorClass="bg-purple-50 text-purple-600" borderClass="border-purple-100" />
                    <StatCard label="Smart Alerts" value={mw.alertsCount} icon={Zap} colorClass="bg-amber-50 text-amber-600" borderClass="border-amber-100" />
                    <StatCard label="Blacklist DBs" value={mw.blacklistCount} icon={ShieldAlert} colorClass="bg-indigo-50 text-indigo-600" borderClass="border-indigo-100" />
                    <StatCard label="Clean Files" value={mw.cleanFiles} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600" borderClass="border-emerald-100" />
                 </div>
               </div>
               
               <div className="shrink-0 flex items-center mt-6 md:mt-0 justify-center z-10">
                 <Link to={`/malware-dashboard?domain=${encodeURIComponent(domain)}`} className="px-8 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-sm font-bold rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
                   Detailed Report <span className="material-symbols-outlined text-sm">arrow_forward</span>
                 </Link>
               </div>
             </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default ScanDashboard;
