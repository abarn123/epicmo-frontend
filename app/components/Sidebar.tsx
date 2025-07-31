"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-8 px-4 shadow-md z-30">
      <div className="mb-15 text-center">
        <img
          src="/epicmo.logo.png"
          alt="Epicmo Logo"
          className="h-8 w-auto mx-auto"
        />
      </div>
      <nav className="flex flex-col gap-4 flex-grow">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors font-medium text-gray-700 dark:text-gray-200 group"
        >
          <svg
            className="w-5 h-5 text-blue-500 group-hover:text-blue-700 transition-colors"
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
          Dashboard
        </Link>
        <Link
          href="/attendance"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors font-medium text-gray-700 dark:text-gray-200 group"
        >
          <svg
            className="w-5 h-5 text-green-500 group-hover:text-green-700 transition-colors"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path d="M16 3v4M8 3v4" />
          </svg>
          Attendance
        </Link>
        <Link
          href="/tools"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors font-medium text-gray-700 dark:text-gray-200 group"
        >
          <svg
            className="w-5 h-5 text-purple-500 group-hover:text-purple-700 transition-colors"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.65 1.65 0 0015 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 008.6 15a1.65 1.65 0 00-1.82-.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0015 8.6a1.65 1.65 0 001.82.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 15z" />
          </svg>
          Tools
        </Link>
        <Link
          href="/user"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-950 transition-colors font-medium text-gray-700 dark:text-gray-200 group"
        >
          <svg
            className="w-5 h-5 text-orange-500 group-hover:text-orange-700 transition-colors"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20c0-2.21 3.582-4 6-4s6 1.79 6 4" />
          </svg>
          User
        </Link>
      </nav>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium text-gray-700 dark:text-gray-200 group"
      >
        <LogOut className="w-5 h-5 text-red-500 group-hover:text-red-700 transition-colors" />
        Logout
      </button>

      <div className="mt-auto text-xs text-gray-400 text-center pt-8">
        © {new Date().getFullYear()} Epicmo
      </div>
    </aside>
  );
}
