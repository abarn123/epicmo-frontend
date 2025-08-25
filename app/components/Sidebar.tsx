"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";

export default function Sidebar() {
  const router = useRouter();
  const { logout, userName, loading, isAuthenticated } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateRole = () => {
      const r = localStorage.getItem("role");
      setRole(r ? r.toLowerCase() : null);
    };
    updateRole();
    window.addEventListener("storage", updateRole);
    return () => {
      window.removeEventListener("storage", updateRole);
    };
  }, []);

  // Reset dropdown and force re-render on logout/login
  useEffect(() => {
    setDropdownOpen(false);
  }, [isAuthenticated, userName]);

  if (!role) {
    // Bisa tampilkan loading, atau menu default
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Helper: cek akses menu
  const canAccess = (menu: string) => {
    if (role === "admin") return true;
    if (role === "staff") {
      return ["dashboard", "attendance", "tools"].includes(menu);
    }
    if (role === "freelance") {
      return ["attendance", "tools"].includes(menu);
    }
    return false;
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-black border-r border-slate-700 flex flex-col shadow-xl z-30">
      {/* Background overlay pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.6))] opacity-10"></div>
      
      {/* Content wrapper with relative positioning */}
      <div className="relative flex flex-col h-full px-4 py-4">
        {/* Logo section - moved to very top */}
        <div className="mb-6 text-center">
          <img
            src="/epicmo.logo.png"
            alt="Epicmo Logo"
            className="h-10 w-auto mx-auto drop-shadow-lg"
          />
        </div>

        {/* User Dropdown */}
        <div className="relative flex flex-col items-center mb-8">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 w-full border border-white/10 bg-white/5"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="User menu"
          >
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-white/20 bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg font-bold shadow-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20c0-2.21 3.582-4 6-4s6 1.79 6 4" />
              </svg>
            </span>
            <span className="font-semibold text-white text-base truncate max-w-[100px] drop-shadow-sm">
              {loading
                ? "Memuat..."
                : isAuthenticated
                ? userName || "User"
                : "User"}
            </span>
            
            <svg
              className="w-4 h-4 ml-1 text-white/70"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute top-16 left-0 w-52 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 z-50 animate-fade-in overflow-hidden"
            >
              <Link
                href="/profile"
                className="block px-4 py-3 text-slate-700 hover:bg-blue-50 transition-colors font-medium"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-3 text-slate-700 hover:bg-red-50 transition-colors border-t border-slate-200 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Logout
              </button>
            </div>
          )}
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          {canAccess("dashboard") && (
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 font-medium text-white/90 hover:text-white group border border-transparent hover:border-white/10"
            >
              <svg
                className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"
                />
              </svg>
              <span className="drop-shadow-sm">Dashboard</span>
            </Link>
          )}
          {canAccess("attendance") && (
            <Link
              href="/attendance"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 font-medium text-white/90 hover:text-white group border border-transparent hover:border-white/10"
            >
              <svg
                className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M16 3v4M8 3v4" />
              </svg>
              <span className="drop-shadow-sm">Attendance</span>
            </Link>
          )}
          {canAccess("tools") && (
            <Link
              href="/tools"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 font-medium text-white/90 hover:text-white group border border-transparent hover:border-white/10"
            >
              <svg
                className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.65 1.65 0 0015 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 008.6 15a1.65 1.65 0 00-1.82-.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0015 8.6a1.65 1.65 0 001.82.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 15z" />
              </svg>
              <span className="drop-shadow-sm">Tools</span>
            </Link>
          )}
          {role === "admin" && (
            <Link
              href="/user"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 font-medium text-white/90 hover:text-white group border border-transparent hover:border-white/10"
            >
              <svg
                className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors drop-shadow-sm"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20c0-2.21 3.582-4 6-4s6 1.79 6 4" />
              </svg>
              <span className="drop-shadow-sm">User</span>
            </Link>
          )}
        </nav>

        <div className="mt-auto text-xs text-white/60 text-center pt-6">
          <div className="border-t border-white/10 pt-4">
            © {new Date().getFullYear()} Epicmo
          </div>
        </div>
      </div>
    </aside>
  );
}