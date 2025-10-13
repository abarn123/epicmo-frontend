"use client";

import React, { ReactNode, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <div className="text-gray-600">Memverifikasi akses...</div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't show sidebar
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // If authenticated, show with responsive sidebar + mobile hamburger
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile open button: attached to screen edge, square with right semicircle */}
      <div className={`md:hidden fixed left-0 top-1/2 z-50 -translate-y-1/2 ${sidebarOpen ? 'hidden' : ''}`}>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          className="h-10 w-7 rounded-r-full bg-blue-600 shadow-md flex items-center justify-center ring-1 ring-blue-400 hover:shadow-lg focus:outline-none"
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Main content (offset on md to make room for fixed sidebar) */}
      <main className="flex-1 p-0 md:ml-72">{children}</main>
    </div>
  );
}
