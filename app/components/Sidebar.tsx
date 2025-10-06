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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!role) {
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
    <aside className="fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 to-black border-r border-gray-700 flex flex-col shadow-2xl z-30">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0.3))] opacity-5"></div>

      {/* Content wrapper */}
      <div className="relative flex flex-col h-full px-6 py-6">
        {/* Logo section */}
        <div className="mb-8 text-center">
          <img
            src="/epicmo.logo.png"
            alt="Epicmo Logo"
            className="h-12 w-auto mx-auto drop-shadow-lg transition-transform hover:scale-105"
          />
        </div>

        {/* User Dropdown */}
        <div className="relative flex flex-col items-center mb-8">
          <button
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all duration-300 w-full group"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-label="User menu"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold shadow-lg ring-2 ring-white/20">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20c0-2.21 3.582-4 6-4s6 1.79 6 4" />
              </svg>
            </div>
            <span className="font-semibold text-white text-sm truncate max-w-[120px] transition-colors group-hover:text-blue-200">
              {loading
                ? "Memuat..."
                : isAuthenticated
                ? userName || "User"
                : "User"}
            </span>

            <svg
              className={`w-4 h-4 ml-auto text-white/60 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
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
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 backdrop-blur-md rounded-xl shadow-2xl border border-gray-600 z-50 overflow-hidden animate-fade-in"
            >
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-400 hover:bg-red-900/50 transition-colors duration-200 border-t border-gray-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-2 flex-grow">
          {canAccess("dashboard") && (
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-medium text-white/90 hover:text-white group border border-transparent hover:border-blue-500/30"
            >
              <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                <svg
                  className="w-5 h-5 text-blue-400 group-hover:text-blue-300 transition-colors"
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
              </div>
              <span className="group-hover:translate-x-1 transition-transform">
                Dashboard
              </span>
            </Link>
          )}

          {canAccess("attendance") && (
            <Link
              href="/attendance"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-medium text-white/90 hover:text-white group border border-transparent hover:border-green-500/30"
            >
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <svg
                  className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M16 3v4M8 3v4" />
                </svg>
              </div>
              <span className="group-hover:translate-x-1 transition-transform">
                Attendance
              </span>
            </Link>
          )}

          {canAccess("tools") && (
            <Link
              href="/tools"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-medium text-white/90 hover:text-white group border border-transparent hover:border-purple-500/30"
            >
              <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <svg
                  className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.65 1.65 0 0015 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 008.6 15a1.65 1.65 0 00-1.82-.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0015 8.6a1.65 1.65 0 001.82.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 15z" />
                </svg>
              </div>
              <span className="group-hover:translate-x-1 transition-transform">
                Tools
              </span>
            </Link>
          )}

          {role === "admin" && (
            <Link
              href="/user"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-medium text-white/90 hover:text-white group border border-transparent hover:border-orange-500/30"
            >
              <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                <svg
                  className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20c0-2.21 3.582-4 6-4s6 1.79 6 4" />
                </svg>
              </div>
              <span className="group-hover:translate-x-1 transition-transform">
                User
              </span>
            </Link>
          )}
          {canAccess("gallery") && (
            <Link
              href="/gallery"
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-medium text-white/90 hover:text-white group border border-transparent hover:border-pink-500/30"
            >
              <div className="p-2 bg-pink-500/10 rounded-lg group-hover:bg-pink-500/20 transition-colors">
                <svg
                  className="w-5 h-5 text-pink-400 group-hover:text-pink-300 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <circle cx="8.5" cy="12.5" r="1.5" />
                  <path d="M21 15l-5-5L5 19" />
                </svg>
              </div>
              <span className="group-hover:translate-x-1 transition-transform">
                Gallery
              </span>
            </Link>
          )}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Epicmo
            <div className="text-[10px] text-gray-500 mt-1">
              v{process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
