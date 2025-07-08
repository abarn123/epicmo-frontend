import React from "react";
import Sidebar from "../components/Sidebar";

const stats = [
  {
    label: "Total Users",
    value: 128,
    icon: (
      <svg
        className="w-8 h-8 text-blue-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    label: "Active Tools",
    value: 12,
    icon: (
      <svg
        className="w-8 h-8 text-purple-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06A1.65 1.65 0 0015 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 008.6 15a1.65 1.65 0 00-1.82-.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0015 8.6a1.65 1.65 0 001.82.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 15z" />
      </svg>
    ),
  },
  {
    label: "Stock Items",
    value: 37,
    icon: (
      <svg
        className="w-8 h-8 text-green-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M16 3v4M8 3v4" />
      </svg>
    ),
  },
  {
    label: "attendance",
    value: 5,
    icon: (
      <svg
        className="w-8 h-8 text-orange-500"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M6 20c0-2.21 3.582-4 6-4s6 1.79 6 4" />
      </svg>
    ),
  },
];

const activities = [
  { time: "09:00", desc: "User Budi Santoso added new tool: Box Epicmo" },
  { time: "10:15", desc: "Stock updated for Tripod box" },
  { time: "11:30", desc: "New user registered: Siti Aminah" },
  { time: "13:00", desc: "Project 'Photo Booth Wedding' created" },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8 ml-64 bg-gradient-to-br from-gray-50 to-blue-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-4 border border-gray-100 hover:shadow-2xl transition"
            >
              <div>{stat.icon}</div>
              <div>
                <div className="text-2xl font-bold text-indigo-700">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Recent Activity
            </h2>
            <ul className="divide-y divide-gray-100">
              {activities.map((act, idx) => (
                <li key={idx} className="py-3 flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-16 flex-shrink-0">
                    {act.time}
                  </span>
                  <span className="text-gray-700 text-sm">{act.desc}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-blue-200 to-indigo-200 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Welcome to Epicmo!
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Manage your users, tools, and projects with a modern, professional
              dashboard. All your activities and stats in one place.
            </p>
            <img
              src="/epicmo.logo.png"
              alt="Epicmo Logo"
              className="w-32 h-32 object-contain mb-2"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
