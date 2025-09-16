"use client";
import React, { useState, useEffect } from "react";
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

// Register komponen Chart.js yang diperlukan untuk Pie Chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Data untuk Pie Charts - tanpa spacing dan borderRadius untuk menghilangkan celah
const toolCategoryData = {
  labels: ["Perkakas", "Elektronik", "Kendaraan", "Peralatan Medis", "Lainnya"],
  datasets: [
    {
      label: "Jumlah Alat",
      data: [45, 30, 15, 8, 12],
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

const statusData = {
  labels: ["Tersedia", "Dipinjam", "Dalam Perbaikan", "Hilang"],
  datasets: [
    {
      label: "Status Alat",
      data: [65, 25, 7, 3],
      backgroundColor: [
        "rgba(16, 185, 129, 0.9)",
        "rgba(59, 130, 246, 0.9)",
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

const borrowingTrendData = {
  labels: ["Peminjaman Aktif", "Sudah Dikembalikan", "Terlambat"],
  datasets: [
    {
      label: "Trend Peminjaman",
      data: [35, 55, 10],
      backgroundColor: [
        "rgba(59, 130, 246, 0.9)",
        "rgba(16, 185, 129, 0.9)",
        "rgba(239, 68, 68, 0.9)",
      ],
      borderColor: [
        "rgba(59, 130, 246, 1)",
        "rgba(16, 185, 129, 1)",
        "rgba(239, 68, 68, 1)",
      ],
      borderWidth: 1,
      
    },
  ],
};

// Options untuk Pie Charts dengan animasi - tanpa spacing
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
          const value = context.raw || 0;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0
          );
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} `;
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
  // Menghilangkan celah antara bagian pie chart
  cutout: "0%", // Pastikan tidak ada donut hole
  radius: "90%", // Pastikan pie chart memenuhi container
};

const MediaDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulasi loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
              {/* Statistik Cards */}
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
                    <p className="text-2xl font-bold text-gray-800">110</p>
                  </div>
                </div>
              </div>

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
                      Peminjaman Aktif
                    </p>
                    <p className="text-2xl font-bold text-gray-800">35</p>
                  </div>
                </div>
              </div>

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
                      Tersedia
                    </p>
                    <p className="text-2xl font-bold text-gray-800">65</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pie Chart 1 - Kategori Alat */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-transform duration-300 ">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Distribusi Kategori Alat
                </h2>
                <div className="h-72 relative">
                  <Pie
                    data={toolCategoryData}
                    options={{
                      ...pieOptions,
                      plugins: {
                        ...pieOptions.plugins,
                        title: {
                          display: true,
                          text: "Kategori Alat",
                          color: "#1F2937",
                          font: {
                            size: 16,
                            weight: "600",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Pie Chart 2 - Status Alat */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-transform duration-300 ">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Status Alat
                </h2>
                <div className="h-72 relative">
                  <Pie
                    data={statusData}
                    options={{
                      ...pieOptions,
                      plugins: {
                        ...pieOptions.plugins,
                        title: {
                          display: true,
                          text: "Status Alat",
                          color: "#1F2937",
                          font: {
                            size: 16,
                            weight: "600",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Pie Chart 3 - Trend Peminjaman */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 transition-transform duration-300 ">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Trend Peminjaman
                </h2>
                <div className="h-72 relative">
                  <Pie
                    data={borrowingTrendData}
                    options={{
                      ...pieOptions,
                      plugins: {
                        ...pieOptions.plugins,
                        title: {
                          display: true,
                          text: "Trend Peminjaman",
                          color: "#1F2937",
                          font: {
                            size: 16,
                            weight: "600",
                          },
                        },
                      },
                    }}
                  />
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