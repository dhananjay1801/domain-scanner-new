import React, { useState, useEffect } from "react";
import { getUsersByOrg, getBlacklistedEmails, blockUserByEmail, unblockUserByEmail, getScanSummaries, getTotalScans } from "../services/api";

function AdminUsers() {
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [usersData, setUsersData] = useState(null);
  const [error, setError] = useState(null);
  
  const [expandedOrgs, setExpandedOrgs] = useState({});
  const [scanSummaries, setScanSummaries] = useState([]);
  const [expandedDomain, setExpandedDomain] = useState(null);
  const [totalScansSystem, setTotalScansSystem] = useState(0);

  const [blacklisted, setBlacklisted] = useState([]);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [emailToBlock, setEmailToBlock] = useState("");
  const [blocking, setBlocking] = useState(false);
  const [notification, setNotification] = useState({ text: "", type: "" });

  const showNotification = (text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification({ text: "", type: "" }), 3000);
  };

  useEffect(() => {
    fetchUsers();
    fetchBlacklist();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const [data, summariesData] = await Promise.all([
        getUsersByOrg(token),
        getScanSummaries(token),
      ]);
      setUsersData(data);
      setScanSummaries(summariesData || []);
      
      try {
        const scansData = await getTotalScans(token);
        setTotalScansSystem(scansData?.total_scans ?? scansData?.total ?? scansData ?? 0);
      } catch (e) {
        console.error("Failed to fetch total scans:", e);
        setTotalScansSystem(0);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlacklist = async () => {
    setBlacklistLoading(true);
    try {
      const data = await getBlacklistedEmails(localStorage.getItem("token"));
      setBlacklisted(data?.blacklisted_emails || []);
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setBlacklistLoading(false);
    }
  };

  const handleBlockEmail = async (e) => {
    e.preventDefault();
    if (!emailToBlock) return;
    setBlocking(true);
    try {
      await blockUserByEmail(emailToBlock, localStorage.getItem("token"));
      showNotification("Email blocked successfully");
      setEmailToBlock("");
      fetchBlacklist();
      fetchUsers(); // Refresh users to update blocked status
    } catch (err) {
      showNotification(err.message, "error");
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockEmail = async (email) => {
    try {
      await unblockUserByEmail(email, localStorage.getItem("token"));
      showNotification("Email unblocked successfully");
      fetchBlacklist();
      fetchUsers(); // Refresh users to update blocked status
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const toggleOrg = (orgId) => {
    setExpandedOrgs(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin">
            progress_activity
          </span>
          <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
            Loading Admin Dashboard Data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
         <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-red-500 block mb-2">error</span>
            <p className="text-red-700 font-medium">{error}</p>
         </div>
      </div>
    );
  }

  const organizations = usersData?.organizations || [];
  const total_users = organizations.reduce((acc, org) => acc + (org.users?.length || 0), 0) + (usersData?.admin?.length || 0);


  return (
    <div className="min-h-screen bg-surface">
      {notification.text && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          {notification.text}
        </div>
      )}

      <div className="p-10 space-y-10">
        {/* Header Section */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-black text-on-surface tracking-tight mb-2">
              User Management
            </h2>
            <p className="text-on-surface-variant max-w-md">
              Orchestrate access levels, monitor subscriptions, and manage
              high-level security permissions across the enterprise.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "users" ? "bg-primary text-white shadow-lg" : "bg-surface-container text-on-surface hover:bg-surface-container-high"}`}
            >
              Organizations
            </button>
            <button 
               onClick={() => setActiveTab("blacklist")}
               className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === "blacklist" ? "bg-red-600 text-white shadow-lg" : "bg-surface-container text-on-surface hover:bg-surface-container-high"}`}
            >
              Blacklist
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-container/30 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">group</span>
              </div>
              <div>
                <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-0.5">
                  Total Users
                </h3>
                <p className="text-2xl font-black text-on-surface leading-none">{total_users}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary-container rounded-full">
              LIVE
            </span>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                <span className="material-symbols-outlined text-lg">shield_with_heart</span>
              </div>
              <div>
                <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mb-0.5">
                  Total Scans Conducted
                </h3>
                <p className="text-2xl font-black text-on-surface leading-none">{totalScansSystem}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-tertiary">+14%</span>
          </div>
        </div>

        {activeTab === "users" && (
            <>
            {/* Registered Entities Table */}
            <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 xl:col-span-12 bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm">
                <div className="px-8 py-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">Organizations &amp; Users</h3>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-surface-container rounded-lg">
                    <span className="material-symbols-outlined">filter_list</span>
                    </button>
                </div>
                </div>
                
                {organizations.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No organizations found.
                    </div>
                ) : (
                    <div className="p-4 space-y-6">
                    {organizations.map((org) => {
                        const ownerEmail = org.users?.find(u => u.role === "owner")?.email || org.users?.[0]?.email || "Unknown";
                        const isExpanded = !!expandedOrgs[org.org_id];
                        
                        return (
                        <div key={org.org_id} className="border border-surface-container rounded-2xl overflow-hidden bg-white">
                            <button 
                                onClick={() => toggleOrg(org.org_id)}
                                className="w-full bg-surface-container-low px-6 py-4 flex justify-between items-center border-b border-surface-container hover:bg-surface-container transition-colors cursor-pointer text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-on-surface text-lg flex items-center gap-2">
                                            {ownerEmail !== "Unknown" ? ownerEmail : `Organization ${(org.org_id ? String(org.org_id) : "").substring(0, 8).toUpperCase()}`}
                                        </h4>
                                        <div className="mt-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <span className="text-xs text-on-surface-variant font-mono">Org ID: {org.org_id}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-6 items-center">
                                    <div className="flex flex-col text-right hidden sm:flex">
                                        <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider mb-1">Max Domains</span>
                                        <span className="text-sm font-semibold">{org.max_domains || 1}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-surface border border-surface-variant flex items-center justify-center text-on-surface-variant">
                                        <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            expand_more
                                        </span>
                                    </div>
                                </div>
                            </button>
                            {isExpanded && (
                            <div className="overflow-x-auto bg-white animate-in slide-in-from-top-2 fade-in duration-200 border-t border-surface-container">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-surface-container-lowest">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">User Email</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Role</th>
                                        <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container bg-white">
                                    {org.users?.filter(u => u.role !== "owner").length > 0 ? org.users.filter(u => u.role !== "owner").map((user) => (
                                        <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs uppercase">
                                                        {user.email.substring(0, 2)}
                                                    </div>
                                                    <span className="text-sm font-semibold text-on-surface">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-surface-container text-on-surface-variant text-[10px] font-bold rounded-full uppercase">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                            {user.is_blacklisted ? (
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase">
                                                        Blocked
                                                    </span>
                                            ) : (
                                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
                                                        Active
                                                    </span>
                                            )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                        <td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">No members bound to this organization.</td>
                                        </tr>
                                    )}
                                    </tbody>
                                </table>

                                {/* Domains Section */}
                                <div className="p-6 bg-surface-container-lowest border-t border-surface-container">
                                    <h5 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Domain Assessment</h5>
                                    <div className="space-y-4">
                                        {!org.domain ? (
                                            <p className="text-sm text-slate-500 text-center">No domains active.</p>
                                        ) : String(org.domain).split(',').map(d => d.trim()).filter(Boolean).map(domain => {
                                            const sum = scanSummaries.find(s => s.domain === domain);
                                            const isDomainExpanded = expandedDomain === domain;
                                            return (
                                                <div key={domain} className="border border-surface-container rounded-xl overflow-hidden shadow-sm">
                                                    <button 
                                                        onClick={() => setExpandedDomain(isDomainExpanded ? null : domain)}
                                                        className="w-full bg-white px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                                <span className="material-symbols-outlined text-sm">language</span>
                                                            </div>
                                                            <span className="font-bold text-on-surface font-mono">{domain}</span>
                                                        </div>
                                                        <div className="flex items-center gap-6">
                                                            {sum ? (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Score</span>
                                                                    <span className={`px-2 py-1 rounded-md text-xs font-black text-white ${
                                                                    sum.severity === 'critical' ? 'bg-red-500' :
                                                                    sum.severity === 'high' ? 'bg-orange-500' :
                                                                    sum.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                                                    }`}>
                                                                        {sum.domain_score}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant px-2 py-1 bg-surface-container rounded-md">Not scanned</span>
                                                            )}
                                                            <span className={`material-symbols-outlined text-on-surface-variant transition-transform ${isDomainExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                                                        </div>
                                                    </button>
                                                    {isDomainExpanded && sum && (
                                                        <div className="p-4 bg-slate-50 border-t border-surface-container grid grid-cols-2 lg:grid-cols-4 gap-4">
                                                            <div className="p-4 bg-white rounded-xl border border-surface-container shadow-sm flex flex-col items-center justify-center text-center">
                                                                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Application Security</span>
                                                                <div className="text-lg font-black text-slate-800">{Object.keys(sum.app_security || {}).length}</div>
                                                                <span className="text-[10px] text-slate-500 font-semibold mt-1">Issues</span>
                                                            </div>
                                                            <div className="p-4 bg-white rounded-xl border border-surface-container shadow-sm flex flex-col items-center justify-center text-center">
                                                                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Network Security</span>
                                                                <div className="text-lg font-black text-slate-800">{Object.keys(sum.network_security || {}).length}</div>
                                                                <span className="text-[10px] text-slate-500 font-semibold mt-1">Issues</span>
                                                            </div>
                                                            <div className="p-4 bg-white rounded-xl border border-surface-container shadow-sm flex flex-col items-center justify-center text-center">
                                                                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">TLS Security</span>
                                                                <div className="text-lg font-black text-slate-800">{Object.keys(sum.tls_security || {}).length}</div>
                                                                <span className="text-[10px] text-slate-500 font-semibold mt-1">Issues</span>
                                                            </div>
                                                            <div className="p-4 bg-white rounded-xl border border-surface-container shadow-sm flex flex-col items-center justify-center text-center">
                                                                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">DNS Security</span>
                                                                <div className="text-lg font-black text-slate-800">{Object.keys(sum.dns_security || {}).length}</div>
                                                                <span className="text-[10px] text-slate-500 font-semibold mt-1">Issues</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
                    )})}
                    </div>
                )}
            </div>
            </div>
            </>
        )}

        {activeTab === "blacklist" && (
            <div className="grid grid-cols-12 gap-8">
                {/* Block Form */}
                <div className="col-span-12 xl:col-span-4 space-y-8">
                    <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-red-100">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mb-6">
                            <span className="material-symbols-outlined">gpp_bad</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Block User Entity</h3>
                        <p className="text-sm text-on-surface-variant mb-6">
                            Enter an email address to immediately block their access across all organizations.
                        </p>
                        <form onSubmit={handleBlockEmail} className="space-y-4">
                             <div>
                                <input
                                    type="email"
                                    value={emailToBlock}
                                    onChange={(e) => setEmailToBlock(e.target.value)}
                                    placeholder="malicious@entity.com"
                                    required
                                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-500/20"
                                />
                             </div>
                             <button 
                                type="submit" 
                                disabled={blocking}
                                className="w-full py-3 bg-red-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-700 transition-all disabled:opacity-50"
                             >
                                {blocking ? "Blocking..." : "Block Email"}
                             </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="col-span-12 xl:col-span-8 bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-8 py-6 border-b border-surface-container">
                        <h3 className="text-xl font-bold text-red-600">Blacklisted Emails</h3>
                        <p className="text-xs text-on-surface-variant mt-1">Currently blocked identities.</p>
                    </div>
                    {blacklistLoading ? (
                        <div className="p-12 text-center text-slate-500">Loading blacklist...</div>
                    ) : blacklisted.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl mb-3 opacity-20">verified_user</span>
                            No entities are currently blacklisted.
                        </div>
                    ) : (
                        <div className="overflow-x-auto max-h-[500px]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-surface-container-low border-b border-surface-container sticky top-0 z-10">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Email Address</th>
                                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-container">
                                    {blacklisted.map((email) => (
                                        <tr key={email} className="hover:bg-red-50 transition-colors">
                                            <td className="px-8 py-4 font-semibold text-on-surface">{email}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                   onClick={() => handleUnblockEmail(email)}
                                                   className="px-4 py-2 bg-white border border-slate-200 text-sm font-semibold rounded-lg hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                                                >
                                                    Unblock
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;

