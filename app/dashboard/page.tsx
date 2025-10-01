"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Options untuk Pie Chart
const pieOptions: ChartOptions<"pie"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "right",
      labels: {
        font: {
          size: 13,
          family: "'Inter', 'sans-serif'",
        },
        color: "#374151",
        padding: 20,
        usePointStyle: true,
        pointStyle: "circle",
      },
    },
    title: {
      display: true,
      color: "#1F2937",
      font: {
        size: 18,
        weight: "bold",
        family: "'Inter', 'sans-serif'",
      },
      padding: {
        top: 10,
        bottom: 20,
      },
    },
    tooltip: {
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      titleColor: "#1F2937",
      bodyColor: "#374151",
      borderColor: "#E5E7EB",
      borderWidth: 1,
      cornerRadius: 8,
      boxPadding: 10,
      usePointStyle: true,
      callbacks: {
        label: function (context) {
          const label = context.label || "";
          const value = Number(context.raw) || 0;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0
          );
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
  animation: {
    animateScale: true,
    animateRotate: true,
    duration: 1500,
    easing: "easeOutQuart",
  },
  transitions: {
    active: {
      animation: {
        duration: 500,
      },
    },
  },
  cutout: "0%",
  radius: "90%",
};

const MediaDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<any>({});
  const [toolsByCategory, setToolsByCategory] = useState<any[]>([]);
  const [roleUsers, setRoleUsers] = useState<any>({});
const [statusSummary, setStatusSummary] = useState<any[]>([]);
const [borrowingTrend, setBorrowingTrend] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        
// Retrieve token from localStorage (or another secure place)
const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";

const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/jumlahdata`, {
  headers: {
    Authorization: `Bearer ${token}`, // wajib, karena ada AuthMiddleware
  }
})

const resCondition = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/kondisi-tools`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

const resRoleUsers = await axios.get(
  `${process.env.NEXT_PUBLIC_API_URL}/role-users`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

const resBorrowingTrend = await axios.get(
  `${process.env.NEXT_PUBLIC_API_URL}/status-logtools`,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);

    setRoleUsers(resRoleUsers.data.data.by_role || {});
    setBorrowingTrend(resBorrowingTrend.data.data.by_status || {});
    setSummary(res.data.data);
    setToolsByCategory(res.data.toolsByCategory || []);
    setStatusSummary(resCondition.data.data || []);
          
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  


    fetchData();
  }, []);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Memuat dashboard...</p>
            </div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  // ===== Chart Data (dinamis dari backend) =====
  const RoleUser = {
    labels: Object.keys(roleUsers),
    datasets: [
      {
        label: "Role Users",
        data: Object.values(roleUsers),
        backgroundColor: [
          "rgba(79, 70, 229, 0.9)",
          "rgba(236, 72, 153, 0.9)",
          "rgba(249, 115, 22, 0.9)",
          "rgba(16, 185, 129, 0.9)",
          "rgba(139, 92, 246, 0.9)",
        ],
        borderColor: [
          "rgba(79, 70, 229, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(16, 185, 129, 1)",
          "rgba(139, 92, 246, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const statusAlat = {
    labels: statusSummary.map((item) => item.item_condition),
    datasets: [
      {
        label: "Status Alat",
        data: statusSummary.map((item) => item.total),
        backgroundColor: [
          "rgba(29, 124, 233, 0.9)",
          "rgba(31, 231, 81, 0.9)",
          "rgba(245, 158, 11, 0.9)",
          "rgba(239, 68, 68, 0.9)",
        ],
        borderColor: [
          "rgba(16, 185, 129, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(245, 158, 11, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const StatusPeminjaman = {
    labels: Object.keys(borrowingTrend),
    datasets: [
      {
        label: " Peminjaman",
        data: Object.values(borrowingTrend),
        backgroundColor: [
          "rgba(15, 71, 253, 0.9)",
          "rgba(16, 185, 129, 0.9)",
        ],
        borderColor: [
          "rgba(15, 71, 253, 0.9)",
          "rgba(16, 185, 129, 0.9)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Dashboard Analytics
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Visualisasi data peminjaman alat dan inventaris dalam bentuk
                grafik interaktif
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Card User */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      User
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.total_users}
                    </p>
                  </div>
                </div>
              </div>

              

              {/* Card Total Alat */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-indigo-100">
                    <svg
                      className="w-6 h-6 text-indigo-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      ></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Alat
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.total_tools}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card total Peminjaman  */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      ></path>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Peminjaman
                    </p>
                    <p className="text-2xl font-bold text-gray-800">
                      {summary.total_transactions}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart role user */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Role Users
                </h2>
                <div className="h-72 relative">
                  <Pie data={RoleUser} options={pieOptions} />
                </div>
              </div>

              {/* Chart Status Alat */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Status Alat
                </h2>
                <div className="h-72 relative">
                  <Pie data={statusAlat} options={pieOptions} />
                </div>
              </div>

              {/* Chart Trend Peminjaman */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Peminjaman
                </h2>
                <div className="h-72 relative">
                  <Pie data={StatusPeminjaman} options={pieOptions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
};

export default MediaDashboard;
