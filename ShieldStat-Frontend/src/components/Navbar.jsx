import { useState, useEffect } from "react";

function Navbar({ isSidebarOpen, onOpenSidebar }) {
  const [availableSlots, setAvailableSlots] = useState(0);

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

  if (isSidebarOpen) return null;

  return (
    <div className="absolute top-6 left-6 z-50">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        aria-label="Open sidebar"
      >
        <span className="material-symbols-outlined">keyboard_double_arrow_right</span>
        {availableSlots > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm animate-pulse">
            +{availableSlots}
          </span>
        )}
      </button>
    </div>
  );
}

export default Navbar;
