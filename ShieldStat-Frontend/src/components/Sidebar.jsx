import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import ResetPasswordModal from "./ResetPasswordModal";

function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState(0);

  // Keep the completion flag in-memory so it resets on full page reload.
  const [malwareScanComplete, setMalwareScanComplete] = useState(() =>
    Boolean(window.__malwareScanCompleted),
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const { getProfile } = await import("../services/api");
        const profile = await getProfile(token);
        const domains = profile?.domain ? (Array.isArray(profile.domain) ? profile.domain : [profile.domain]) : [];
        const uniqueDomains = new Set(domains.map(d => d.trim().toLowerCase()).filter(Boolean));
        const slots = Math.max(0, (profile?.max_domains || 0) - uniqueDomains.size);
        setAvailableSlots(slots);
      } catch (err) {}
    };

    fetchProfile();
    window.addEventListener("profile-updated", fetchProfile);
    return () => window.removeEventListener("profile-updated", fetchProfile);
  }, []);

  useEffect(() => {
    const onComplete = () => setMalwareScanComplete(true);

    window.addEventListener("malware-scan-complete", onComplete);

    return () => {
      window.removeEventListener("malware-scan-complete", onComplete);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const baseClass =
    "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 overflow-hidden";

  const activeClass = "text-indigo-700 font-semibold bg-indigo-50 shadow-sm";

  const inactiveClass =
    "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50";

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-slate-50 transition-all duration-300 ${
        isOpen ? "w-72 px-6 py-8" : "w-0 border-r-0 px-0 py-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`absolute top-8 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 ${
          isOpen ? "right-[-22px]" : "right-[-56px]"
        }`}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      >
        <span className="material-symbols-outlined">
          {isOpen
            ? "keyboard_double_arrow_left"
            : "keyboard_double_arrow_right"}
        </span>
      </button>

      <div
        className={`flex h-full min-h-0 flex-col overflow-y-auto ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {/* Logo */}
        <div className="mb-10 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-900 font-headline">
            <img
              src={logo}
              alt="Company Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-2">
          {/* Scan Dashboard (moved to top per request) */}
          <Link
            to="/scan-dashboard"
            className={`${baseClass} ${isActive("/scan-dashboard") ? activeClass : inactiveClass}`}
          >
            <span
              className={
                isActive("/scan-dashboard")
                  ? "absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full transition-all duration-200"
                  : "absolute left-0 top-0 bottom-0 w-0 bg-indigo-600 rounded-r-full transition-all duration-200"
              }
            />
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/assessment"
            className={`${baseClass} ${isActive("/assessment") ? activeClass : inactiveClass}`}
          >
            <span
              className={
                isActive("/assessment")
                  ? "absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full transition-all duration-200"
                  : "absolute left-0 top-0 bottom-0 w-0 bg-indigo-600 rounded-r-full transition-all duration-200"
              }
            />
            <span className="material-symbols-outlined">security</span>
            <span>Assessment</span>
          </Link>

          {/* New Scan always present */}
          <Link
            to="/scan"
            className={`${baseClass} ${isActive("/scan") ? activeClass : inactiveClass}`}
          >
            <span
              className={
                isActive("/scan")
                  ? "absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full transition-all duration-200"
                  : "absolute left-0 top-0 bottom-0 w-0 bg-indigo-600 rounded-r-full transition-all duration-200"
              }
            />
            <span className="material-symbols-outlined">radar</span>
            <div className="flex flex-1 items-center justify-between">
              <span>Audit Domain</span>
              {availableSlots > 0 && (
                <div className="flex h-5 items-center justify-center rounded-full bg-rose-100 px-2 text-[10px] font-black text-rose-700 shadow-sm animate-pulse">
                  +{availableSlots}
                </div>
              )}
            </div>
          </Link>

          {/* Dashboard link moved to top of the menu */}

          {/* Scan History moved into the New Scan page header per UX request */}

          {/* Malware Scan link */}
          <Link
            to="/malware"
            className={`${baseClass} ${isActive("/malware") ? activeClass : inactiveClass}`}
          >
            <span
              className={
                isActive("/malware")
                  ? "absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full transition-all duration-200"
                  : "absolute left-0 top-0 bottom-0 w-0 bg-indigo-600 rounded-r-full transition-all duration-200"
              }
            />
            <span className="material-symbols-outlined">bug_report</span>
            <div className="flex flex-1 items-center justify-between">
              <span>Malware Scan</span>
              {availableSlots > 0 && (
                <div className="flex h-5 items-center justify-center rounded-full bg-rose-100 px-2 text-[10px] font-black text-rose-700 shadow-sm animate-pulse">
                  +{availableSlots}
                </div>
              )}
            </div>
          </Link>



          {/* Malware Scan History moved to the Malware page header per UX request */}
        </nav>

        {/* Bottom */}
        <div className="space-y-2 border-t border-slate-200 pt-8">
          <Link to="/profile" className={`${baseClass} ${inactiveClass}`}>
            <span className="material-symbols-outlined">account_circle</span>
            <span>Profile</span>
          </Link>

          <button 
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className={`w-full text-left ${baseClass} ${inactiveClass}`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
        </div>
      </div>

      <ResetPasswordModal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
      />
    </aside>
  );
}

export default Sidebar;
