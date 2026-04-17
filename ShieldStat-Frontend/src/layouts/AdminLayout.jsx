import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

function SidebarLink({ to, icon, children }) {
  const location = useLocation();
  const isActive = to !== "#" && location.pathname === to;

  const baseClass =
    "relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 overflow-hidden";
  const activeClass = "text-primary font-bold bg-primary/5 shadow-sm";
  const inactiveClass = "text-on-surface hover:text-primary hover:bg-primary/5";

  return (
    <Link
      to={to}
      className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
    >
      <span
        className={
          isActive
            ? "absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full transition-all duration-200"
            : "absolute left-0 top-0 bottom-0 w-0 bg-primary rounded-r-full transition-all duration-200"
        }
      />
      <span className="material-symbols-outlined">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

function AdminLayout() {
  const [isOpen, setIsOpen] = React.useState(true);
  const navigate = useNavigate();

  const onToggle = () => setIsOpen((v) => !v);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen">
      {/* Admin Sidebar */}
      <aside
        className={`sticky top-0 flex flex-col h-screen overflow-hidden border-r bg-surface transition-all duration-300 ${
          isOpen ? "w-72 px-6 py-8 border-r" : "w-0 border-r-0 px-0 py-0"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Toggle button */}
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
          <div className="mb-12 px-2">
            <div className="flex items-center gap-3">
              <div>
                <img
                  src={logo}
                  alt="Company Logo"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <SidebarLink to="/admin" icon="group">
              User Management
            </SidebarLink>
            <SidebarLink to="/admin/subscription" icon="payments">
              Subscription Management
            </SidebarLink>
          </nav>

          <div className="pt-8 mt-8 border-t space-y-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-on-surface hover:text-error transition-colors bg-transparent border-none outline-none cursor-pointer text-left"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-medium text-base">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main area with outlet */}
      <div className="flex-1 ml-0 relative">
          {!isOpen && (
              <button
                type="button"
                onClick={onToggle}
                className="absolute top-4 left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                aria-label="Open sidebar"
              >
                <span className="material-symbols-outlined">
                  keyboard_double_arrow_right
                </span>
              </button>
          )}

        <main className="p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
