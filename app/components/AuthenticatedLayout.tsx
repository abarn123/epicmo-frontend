"use client";

import React, { ReactNode, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import { FiMenu } from "react-icons/fi";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { isAuthenticated, loading } = useAuth();

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

  // If authenticated, show with responsive sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm sticky top-0 z-20">
        <button
          className="text-2xl text-gray-700 focus:outline-none"
          onClick={() => setSidebarOpen(true)}
          aria-label="Buka menu"
        >
          <FiMenu />
        </button>
        <span className="text-lg font-bold text-gray-800">Epicmo</span>
        <div />
      </div>
      {/* Sidebar (drawer on mobile, static on desktop) */}
      <div
        className={`fixed inset-0 z-30 bg-black bg-opacity-40 transition-opacity duration-200 md:hidden ${sidebarOpen ? "block" : "hidden"}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-200 md:static md:translate-x-0 md:block ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ maxWidth: 280 }}
        aria-label="Sidebar"
      >
        <div className="flex justify-end md:hidden p-4">
          <button
            className="text-2xl text-gray-700 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup menu"
          >
            ×
          </button>
        </div>
        <Sidebar />
      </aside>
      {/* Main content */}
      <main className="flex-1 md:ml-64 p-2 sm:p-4 md:p-8 transition-all duration-200">{children}</main>
    </div>
  );
} 