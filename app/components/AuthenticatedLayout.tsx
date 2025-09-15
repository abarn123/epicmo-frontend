"use client";

import React, { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({
  children,
}: AuthenticatedLayoutProps) {
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

  // If authenticated, show with static sidebar (no mobile functionality)
  return (
    <div className="min-h-screen flex">
      {/* Sidebar (static on all devices) */}
      <aside className="w-64 bg-white shadow-lg" aria-label="Sidebar">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="flex-1 p-0">{children}</main>
    </div>
  );
}
