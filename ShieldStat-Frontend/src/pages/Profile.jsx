import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  getProfile,
  getMembers,
  inviteMember,
  getScore,
  redeemPromo,
} from "../services/api";

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
    const normalizedDomain = normalizeDomain(domain);
    const key = normalizedDomain.toLowerCase();
    if (!normalizedDomain || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function clearDomainCaches() {
  localStorage.removeItem("scannedDomains");
  localStorage.removeItem("lastScannedDomain");
  localStorage.removeItem("malware_last_scan");
}
function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // ─── Profile state ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [domainScans, setDomainScans] = useState([]);
  const [domainScansLoading, setDomainScansLoading] = useState(false);

  // ─── Members state ─────────────────────────────────────────────────────────
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // ─── Invite state ──────────────────────────────────────────────────────────
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);

  // ─── Promo / domain state ──────────────────────────────────────────────────
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  // ─── Fetch profile on mount ────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate("/auth");
      return;
    }

    async function load() {
      try {
        const data = await getProfile(token);
        setProfile(data);

        // Fetch members for all users
        setMembersLoading(true);
        try {
          const membersList = await getMembers(token);
          setMembers(membersList);
        } catch {
          // Member fetch failed silently
        } finally {
          setMembersLoading(false);
        }
      } catch {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        clearDomainCaches();
        navigate("/auth");
      } finally {
        setProfileLoading(false);
      }
    }

    load();
  }, [token, navigate]);

  useEffect(() => {
    if (!profile || !token) return;

    const domains = dedupeDomains(normalizeProfileDomains(profile.domain));

    if (domains.length === 0) {
      setDomainScans([]);
      setDomainScansLoading(false);
      return;
    }

    let cancelled = false;

    async function loadDomainScans() {
      setDomainScansLoading(true);
      const scans = await Promise.all(
        domains.map(async (domainName) => {
          try {
            const scoreData = await getScore(domainName, token);
            return {
              target: domainName,
              hasScan: true,
              score: scoreData?.domain_score ?? null,
            };
          } catch {
            return {
              target: domainName,
              hasScan: false,
              score: null,
            };
          }
        }),
      );

      if (!cancelled) {
        setDomainScans(scans);
        setDomainScansLoading(false);
      }
    }

    loadDomainScans();

    return () => {
      cancelled = true;
    };
  }, [profile, token]);

  // ─── Invite handler ────────────────────────────────────────────────────────
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");

    if (!inviteEmail) {
      setInviteError("Please enter an email address");
      return;
    }

    setInviteLoading(true);
    try {
      const data = await inviteMember(inviteEmail, token);
      setInviteSuccess(data.message || "Invitation sent successfully!");
      setInviteEmail("");
      setShowInviteForm(false);

      // Refresh members list
      const membersList = await getMembers(token);
      setMembers(membersList);
    } catch (err) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };


  const refreshProfile = async () => {
    const data = await getProfile(token);
    setProfile(data);
  };

  const handleRedeemPromo = async (e) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    const code = promoCode.trim();
    if (!code) {
      setPromoError("Please enter a promo code");
      return;
    }

    setPromoLoading(true);
    try {
      const data = await redeemPromo(code, token);
      setPromoSuccess(data.message || "Promo redeemed successfully");
      setPromoCode("");
      await refreshProfile();
      window.dispatchEvent(new Event("profile-updated"));
    } catch (err) {
      setPromoError(err.message || "Failed to redeem promo code");
    } finally {
      setPromoLoading(false);
    }
  };


  // ─── Logout handler ────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    clearDomainCaches();
    navigate("/auth");
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const getInitials = (email) => {
    return email ? email.substring(0, 2).toUpperCase() : "??";
  };

  if (profileLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  const isOwner = profile?.role === "owner";
  const teamMembers = members.filter((member) => {
    if (!profile) return true;

    if (profile.user_id && member.user_id) {
      return member.user_id !== profile.user_id;
    }

    if (profile.email && member.email) {
      return member.email.toLowerCase() !== profile.email.toLowerCase();
    }

    return true;
  });

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-indigo-600">
            Account Overview
          </p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-slate-900">
            User Profile
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Manage your profile, team members, and monitor domain activity from
            one place.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          {showPromoForm ? (
            <form onSubmit={handleRedeemPromo} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promo code"
                autoFocus
                className="h-11 min-w-[190px] rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
              />
              <button
                type="submit"
                disabled={promoLoading}
                className="inline-flex h-11 min-w-[108px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {promoLoading && <Loader2 size={16} className="animate-spin" />}
                Redeem
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowPromoForm(true);
                setPromoError("");
                setPromoSuccess("");
              }}
              className="inline-flex h-11 min-w-[108px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Redeem Promo
              <span className="material-symbols-outlined text-[18px]">redeem</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-11 min-w-[108px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            Logout
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </div>
      {(promoError || promoSuccess) && (
        <div className="mb-4 space-y-1">
          {promoError && <p className="text-sm text-red-600">{promoError}</p>}
          {promoSuccess && <p className="text-sm text-emerald-600">{promoSuccess}</p>}
        </div>
      )}



      {/* ─── Success / Error banners (for invite) ─── */}
      {inviteSuccess && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {inviteSuccess}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ═══════════════ USER CARD ═══════════════ */}
        <section className="lg:col-span-4">
          <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-indigo-100 bg-slate-100 text-2xl font-bold text-indigo-700">
                {getInitials(profile?.email)}
              </div>
              
              <span className="mt-1 inline-block rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-bold uppercase text-indigo-700">
                {profile?.role}
              </span>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500">Email</span>
                <span className="ml-4 truncate font-semibold text-slate-900">
                  {profile?.email}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500">Role</span>
                <span className="font-semibold capitalize text-slate-900">
                  {profile?.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500">
                  No. of Domains
                </span>
                <span className="font-semibold text-slate-900">
                  {profile?.max_domains ?? 0}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ TEAM MEMBERS (owner only) ═══════════════ */}
        <section className="lg:col-span-8">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-5">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Team Members
                </h2>
                <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                  Tier Limit: 4 per team
                </p>
              </div>
              {isOwner && (
                <button
                  onClick={() => {
                    setShowInviteForm(!showInviteForm);
                    setInviteError("");
                    setInviteSuccess("");
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:brightness-110"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    person_add
                  </span>
                  Invite
                </button>
              )}
            </div>

            {/* Invite form (toggleable) */}
            {showInviteForm && isOwner && (
              <div className="border-b border-slate-100 bg-slate-50/30 px-6 py-4">
                <form onSubmit={handleInvite} className="flex gap-2">
                  <input
                    id="invite-email"
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="flex-grow rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    id="invite-submit"
                    type="submit"
                    disabled={inviteLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                  >
                    {inviteLoading && (
                      <Loader2 size={14} className="animate-spin" />
                    )}
                    Send
                  </button>
                </form>
                {inviteError && (
                  <p className="mt-2 text-xs text-red-600">{inviteError}</p>
                )}
              </div>
            )}

            {/* Members list */}
            <div className="max-h-[290px] flex-grow divide-y divide-slate-100 overflow-y-auto">
              {membersLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-indigo-600" />
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <span className="material-symbols-outlined mb-2 text-3xl">
                    group_off
                  </span>
                  <p className="text-sm">No members yet</p>
                  {isOwner && (
                    <p className="mt-1 text-xs">
                      Use the Invite button to add team members
                    </p>
                  )}
                </div>
              ) : (
                teamMembers.map((member) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-indigo-700">
                        {getInitials(member.email)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">
                          {member.email}
                        </span>
                        <span className="text-[10px] uppercase text-slate-500">
                          {member.role}
                        </span>
                      </div>
                    </div>
                    <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                      Active
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <p className="text-[10px] font-black uppercase text-slate-500">
                {teamMembers.length}/4 Members
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ═══════════════ ACTIVE DOMAIN SCANS ═══════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-full">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-indigo-600">
                  list_alt
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  Active Domain Scans
                </h3>
              </div>
              <span className="rounded-full border border-indigo-200 bg-indigo-100 px-3 py-1 text-[11px] font-bold text-indigo-700">
                {domainScans.length} Domains
              </span>
            </div>

            <div className="max-h-[350px] divide-y divide-slate-100 overflow-y-auto">
              {domainScansLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="animate-spin text-indigo-600" />
                </div>
              ) : domainScans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <span className="material-symbols-outlined mb-2 text-3xl">
                    dns
                  </span>
                  <p className="text-sm">No domains configured</p>
                  <p className="mt-1 text-xs">Scan required</p>
                </div>
              ) : (
                domainScans.map((scan) => (
                  <div
                    key={scan.target}
                    className="flex items-center justify-between px-6 py-5 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <span className="material-symbols-outlined text-xl text-indigo-600">
                          dns
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-900">
                          {scan.target}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="mb-0.5 block text-[10px] font-bold uppercase text-slate-500">
                          Health Score
                        </span>
                        <span
                          className={`text-xl font-black ${
                            scan.hasScan ? "text-indigo-700" : "text-amber-600"
                          }`}
                        >
                          {scan.hasScan && scan.score !== null ? scan.score : "Scan required"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            scan.hasScan
                              ? `/scan-dashboard?domain=${encodeURIComponent(scan.target)}`
                              : "/scan",
                          )
                        }
                        className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100"
                        aria-label={scan.hasScan ? "Open scan dashboard" : "Start scan"}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {scan.hasScan ? "open_in_new" : "radar"}
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;









