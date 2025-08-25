"use client";
import Sidebar from "../components/Sidebar";
import { FiMenu, FiSearch, FiDownload, FiCalendar, FiFilter, FiX } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface AttendanceRecord {
  id: number;
  photo: string;
  name: string;
  date: string;
  time: string;
  status: "present" | "permission" | "sick";
}

export default function AttendancePage() {
  // Added mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const itemsPerPage = 5;

  // Fungsi untuk memformat waktu dari berbagai kemungkinan format
  const formatTimeFromAPI = (timeString: string | undefined) => {
    if (!timeString) return "-";

    try {
      // Jika format ISO (YYYY-MM-DDTHH:MM:SS)
      if (timeString.includes("T")) {
        const date = new Date(timeString);
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      // Jika format HH:MM:SS
      else if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
        const [hours, minutes] = timeString.split(":");
        return `${hours}:${minutes}`;
      }
      // Jika format timestamp
      else if (!isNaN(Number(timeString))) {
        const date = new Date(Number(timeString));
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      // Jika format lain, tampilkan apa adanya
      return timeString;
    } catch {
      return timeString;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token tidak ditemukan. Silakan login kembali.");
          return;
        }
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/data4`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let data = response.data;

        // Jika data dibungkus dalam objek, ambil array-nya
        if (data && typeof data === "object" && !Array.isArray(data)) {
          if (Array.isArray(data.data)) {
            data = data.data;
          } else if (Array.isArray(data.attendances)) {
            data = data.attendances;
          }
        }

        // Normalisasi data agar sesuai tipe AttendanceRecord
        const processed = (Array.isArray(data) ? data : []).map(
          (item: any, idx: number) => {
            // Cek apakah ada field waktu terpisah atau digabung dengan tanggal
            const hasSeparateTimeField = item.time !== undefined;
            const dateFromAPI = item.date || item.timestamp || item.createdAt;

            return {
              id: item.id ?? idx + 1,
              photo: item.photo || "/images/employee1.jpg",
              name: item.name || "-",
              date: dateFromAPI
                ? new Date(dateFromAPI).toLocaleDateString()
                : "-",
              time: hasSeparateTimeField
                ? formatTimeFromAPI(item.time)
                : dateFromAPI
                ? formatTimeFromAPI(dateFromAPI)
                : "-",
              status: item.status || "present",
            };
          }
        );

        setAttendanceData(processed);
      } catch (err: any) {
        setError("Gagal mengambil data absensi");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "sick":
        return "bg-red-100 text-red-800";
      case "permission":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fungsi untuk filter data
  const filteredData = attendanceData.filter((record) => {
    const matchesSearch = record.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesDate = filterDate
      ? record.date === new Date(filterDate).toLocaleDateString()
      : true;
    const matchesStatus = filterStatus ? record.status === filterStatus : true;

    return matchesSearch && matchesDate && matchesStatus;
  });

  // Pagination logic dengan data yang sudah difilter
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Reset ke halaman 1 ketika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDate, filterStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600 text-lg">Memuat data absensi...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Gagal Memuat Data
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex w-full overflow-x-hidden">
      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out md:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar />
        {/* Close button overlay for mobile */}
        <button
          className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
          onClick={() => setSidebarOpen(false)}
          aria-label="Tutup menu"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 md:ml-64 min-w-0">
        {/* Mobile header with hamburger menu */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-30 border-b border-white/20">
          <button
            className="text-2xl text-gray-700 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <FiMenu />
          </button>
          <h1 className="text-lg font-bold text-gray-800">Absensi Karyawan</h1>
          <div className="w-10" />
        </div>

        <div className="p-3 sm:p-4 md:p-6 w-full max-w-full">
          <div className="mx-auto w-full px-0 sm:px-0">
            {/* Header - hidden on mobile, shown on desktop */}
            <div className="mb-8 hidden md:block">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Dashboard Absensi
                </h1>
                <p className="text-gray-600">
                  Sistem pemantauan kehadiran karyawan real-time
                </p>
              </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white/80 backdrop-blur-sm p-4 md:p-6 rounded-xl shadow-sm mb-6 border border-white/20">
              <div className="flex flex-col sm:flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                <div className="relative flex-1 max-w-full lg:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg leading-5 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                    placeholder="Cari nama karyawan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      className="block w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg leading-5 bg-white/70 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiFilter className="text-gray-400" />
                    </div>
                    <select
                      className="block w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg leading-5 bg-white/70 backdrop-blur-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">Semua Status</option>
                      <option value="present">Hadir</option>
                      <option value="permission">Izin</option>
                      <option value="sick">Sakit</option>
                    </select>
                  </div>

                  <a
                    href="/attendance/data"
                    className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-xs sm:text-sm font-medium rounded-lg shadow-md text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
                  >
                    <FiDownload className="mr-2" />
                    Isi Absen
                  </a>
                </div>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden border border-white/20 w-full">
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Foto
                      </th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Nama Karyawan
                      </th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Waktu
                      </th>
                      <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/60 backdrop-blur-sm divide-y divide-gray-100">
                    {currentItems.length > 0 ? (
                      currentItems.map((record, index) => (
                        <tr key={record.id} className="hover:bg-white/80 transition-all duration-200">
                          <td className="px-3 md:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                            {indexOfFirstItem + index + 1}
                          </td>
                          <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 shadow-md ring-2 ring-white">
                              {record.photo ? (
                                <img
                                  className="h-full w-full object-cover"
                                  src={
                                    record.photo.startsWith("http")
                                      ? record.photo
                                      : record.photo.length > 100 &&
                                        !record.photo.startsWith("data:")
                                      ? `data:image/jpeg;base64,${record.photo}`
                                      : record.photo
                                  }
                                  alt={record.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/images/employee1.jpg";
                                  }}
                                />
                              ) : (
                                <img
                                  className="h-full w-full object-cover"
                                  src="/images/employee1.jpg"
                                  alt="default"
                                />
                              )}
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-4 whitespace-nowrap max-w-[120px] md:max-w-none truncate">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {record.name}
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                            {record.date}
                          </td>
                          <td className="px-3 md:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                            {record.time}
                          </td>
                          <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(
                                record.status
                              )}`}
                            >
                              {record.status === "present" && "Hadir"}
                              {record.status === "permission" && "Izin"}
                              {record.status === "sick" && "Sakit"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 md:px-6 py-12 text-center"
                        >
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-medium">Tidak ada data ditemukan</p>
                            <p className="text-sm">Coba ubah filter pencarian Anda</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Footer */}
            {totalItems > 0 && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-2">
                  <nav className="flex items-center space-x-1" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm"
                      }`}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === number
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                            : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm"
                        }`}
                      >
                        {number}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm"
                      }`}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}