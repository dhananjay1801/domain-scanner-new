'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Building2, ChevronDown, ShieldAlert, BadgeCheck, Network, LockKeyhole } from 'lucide-react';

// MOCK DATA: Structured by Organization. One primary login, N sub-members.
const MOCK_ORGS = [
  { 
    id: 'org_1', 
    name: 'Vanguard Dynamics', 
    industry: 'Finance', 
    domain: 'vanguard.io', 
    status: 'ACTIVE',
    members: [
      { id: 'u_1', name: 'John Shepard', email: 'jshepard@vanguard.io', role: 'PRIMARY_LOGIN', lastActive: '2 min ago' },
      { id: 'u_2', name: 'Miranda Lawson', email: 'mlawson@vanguard.io', role: 'SUB_MEMBER', lastActive: '5 hours ago' }
    ]
  },
  { 
    id: 'org_2', 
    name: 'Swarm Security', 
    industry: 'CyberSec', 
    domain: 'swarm.sec', 
    status: 'ACTIVE',
    members: [
      { id: 'u_3', name: 'Sarah Kerrigan', email: 'skerrigan@swarm.sec', role: 'PRIMARY_LOGIN', lastActive: '1 hr ago' },
      { id: 'u_4', name: 'Alexei Stukov', email: 'astukov@swarm.sec', role: 'SUB_MEMBER', lastActive: '3 days ago' },
      { id: 'u_5', name: 'Abathur', email: 'abathur@swarm.sec', role: 'SUB_MEMBER', lastActive: 'System' }
    ]
  },
  { 
    id: 'org_3', 
    name: 'Citadel Group', 
    industry: 'Government', 
    domain: 'citadel.gov', 
    status: 'SUSPENDED',
    members: [
      { id: 'u_6', name: 'David Anderson', email: 'dander@citadel.gov', role: 'PRIMARY_LOGIN', lastActive: '4 days ago' }
    ]
  },
  { 
    id: 'org_4', 
    name: 'ShadowBroker Corp', 
    industry: 'Data Broker', 
    domain: 'shadowbroker.io', 
    status: 'ACTIVE',
    members: [
      { id: 'u_7', name: 'Liara T\'Soni', email: 'liara@shadowbroker.io', role: 'PRIMARY_LOGIN', lastActive: 'Now' },
      { id: 'u_8', name: 'Feron', email: 'feron@shadowbroker.io', role: 'SUB_MEMBER', lastActive: '2 weeks ago' }
    ]
  }
];

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrgId, setExpandedOrgId] = useState<string | null>(null);

  // Filter organizations by org name or domain
  const filteredOrgs = MOCK_ORGS.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    org.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    if (expandedOrgId === id) {
      setExpandedOrgId(null);
    } else {
      setExpandedOrgId(id);
    }
  };

  return (
    <div className="p-8 md:p-12 min-h-screen flex flex-col gap-8 max-w-[1600px] mx-auto bg-[#fcfcfc]">
       
       <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">SYS_OPERATORS</h1>
          <p className="text-sm text-slate-500 font-medium tracking-tight">Organization Access Matrix. 1 Primary Login permitted per Org.</p>
        </div>

        {/* Global Search Interface */}
        <div className="relative w-full md:w-96 shadow-sm">
           <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
             type="text" 
             placeholder="Search organization or domain..." 
             className="w-full bg-white border border-slate-200 text-slate-900 font-medium text-sm rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#3b2a8d] focus:ring-4 focus:ring-[#3b2a8d]/10 transition-all placeholder:text-slate-400"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </motion.div>

      {/* Modern Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full overflow-hidden border border-slate-100 bg-white rounded-[2.5rem] shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/3">Organization / Domain</th>
                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/4">Industry</th>
                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Status</th>
                <th className="py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Team Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgs.map((org, i) => (
                <React.Fragment key={org.id}>
                  {/* Master Organization Row */}
                  <motion.tr 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    onClick={() => toggleExpand(org.id)}
                    className={`transition-colors group cursor-pointer ${expandedOrgId === org.id ? 'bg-[#3b2a8d]/5 border-l-4 border-l-[#3b2a8d]' : 'hover:bg-slate-50 border-l-4 border-l-transparent'}`}
                  >
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-colors ${expandedOrgId === org.id ? 'bg-[#3b2a8d] text-white' : 'bg-slate-100 text-[#3b2a8d]'}`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold mb-0.5 tracking-tight group-hover:text-[#3b2a8d] transition-colors">{org.name}</p>
                          <p className="text-slate-500 text-[11px] font-medium">{org.domain}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">{org.industry}</span>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${org.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={`font-black text-[10px] tracking-widest uppercase ${org.status === 'ACTIVE' ? 'text-slate-900' : 'text-red-500'}`}>{org.status}</span>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex justify-end items-center gap-4">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-purple-700 z-20">1</div>
                          {org.members.length > 1 && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500 z-10">
                              +{org.members.length - 1}
                            </div>
                          )}
                        </div>
                        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${expandedOrgId === org.id ? 'rotate-180 text-[#3b2a8d]' : ''}`} />
                      </div>
                    </td>
                  </motion.tr>

                  {/* Expanded Accordion Members View */}
                  <AnimatePresence>
                    {expandedOrgId === org.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <td colSpan={4} className="p-0 border-b-4 border-b-slate-100 bg-[#3b2a8d]/[0.02]">
                          <div className="px-12 py-10 flex flex-col gap-6">
                            
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#3b2a8d]/60 mb-2 flex items-center gap-2">
                               <Network className="w-4 h-4" />
                               Organization Network Topology ({org.members.length})
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {org.members.map((member) => (
                                <div key={member.id} className={`p-5 rounded-2xl border flex items-start gap-4 transition-all ${member.role === 'PRIMARY_LOGIN' ? 'bg-white border-[#3b2a8d]/20 shadow-sm' : 'bg-white/50 border-slate-200'}`}>
                                  {/* Avatar Ring */}
                                  <div className="relative">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xs ${member.role === 'PRIMARY_LOGIN' ? 'bg-gradient-to-tr from-[#3b2a8d] to-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'}`}>
                                      {member.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    {member.role === 'PRIMARY_LOGIN' && (
                                      <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border-2 border-white" title="Primary Auth Owner">
                                        <BadgeCheck className="w-3 h-3" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Member Info */}
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <p className="text-sm font-bold text-slate-900 group-hover:text-[#3b2a8d] mb-0.5">{member.name}</p>
                                      {member.role === 'SUB_MEMBER' && (
                                        <span title="Restricted Login">
                                          <LockKeyhole className="w-3 h-3 text-slate-400" />
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-500 mb-2">{member.email}</p>
                                    
                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${member.role === 'PRIMARY_LOGIN' ? 'bg-[#3b2a8d]/10 text-[#3b2a8d]' : 'bg-slate-100 text-slate-500'}`}>
                                        {member.role.replace('_', ' ')}
                                      </span>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                        Active: {member.lastActive}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredOrgs.length === 0 && (
            <div className="p-16 text-center text-slate-400 font-black text-sm tracking-widest uppercase">
              NO ORGANIZATIONS DETECTED IN QUADRANT
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
