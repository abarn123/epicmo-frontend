"use client";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { FiSearch, FiDownload, FiCalendar, FiFilter, FiX, FiClock, FiCalendar as FiCal, FiFileText } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface AttendanceRecord {
  id: number;
  photo: string;
  name: string;
  date: string;
  time: string;
  status: "ready" | "finish";
  notes?: string;
}

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const itemsPerPage = 5;
  const router = useRouter();

  // Modal state for image preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [previewName, setPreviewName] = useState<string>("");

  // Modal state for notes detail
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");

  // Fungsi untuk update tanggal dan waktu saat ini
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDateTime = now.toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentDateTime(formattedDateTime);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

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

  // Fungsi untuk memotong teks catatan
  const truncateNotes = (text: string, maxWords: number = 5, maxChars: number = 60) => {
    if (!text) return "";
    
    const words = text.split(" ");
    const truncatedByWords = words.slice(0, maxWords).join(" ");
    
    if (truncatedByWords.length > maxChars) {
      return text.substring(0, maxChars);
    }
    
    return truncatedByWords;
  };

  // Fungsi untuk cek apakah catatan perlu dipotong
  const shouldTruncateNotes = (text: string, maxWords: number = 5, maxChars: number = 60) => {
    if (!text) return false;
    const words = text.split(" ");
    return words.length > maxWords || text.length > maxChars;
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
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/data4`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
              notes: item.notes || item.note || item.description || "",
            };
          }
        );

        setAttendanceData(processed);
      } catch (err: any) {
        console.error("Error fetching data:", err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            setError("Token tidak valid. Silakan login kembali.");
            localStorage.removeItem("token");
            router.push("/login");
          } else if (err.code === "ERR_NETWORK") {
            setError("Kesalahan jaringan: Tidak dapat terhubung ke server.");
          } else if (err.response?.status === 403) {
            setError(
              "Akses ditolak. Anda tidak memiliki izin untuk mengakses data ini."
            );
          } else if (err.response) {
            setError(
              `Gagal mengambil data: ${err.response.status} - ${
                err.response.data?.message || err.message
              }`
            );
          } else {
            setError("Gagal mengambil data absensi");
          }
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Terjadi kesalahan yang tidak diketahui");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "finish":
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
    // If error is authentication related, show access denied message
    if (error.includes("Token") || error.includes("login")) {
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Akses Ditolak
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md w-full flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    // For other errors, show the empty-state inside the authenticated layout
    return (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <div className="min-h-screen flex w-full overflow-x-hidden">
            <div className="flex-1 min-w-0 p-3 sm:p-4 md:p-6 w-full max-w-full">
              <div className="mx-auto w-full px-0 sm:px-0">
                {/* Header - hidden on mobile, shown on desktop */}
                <div className="mb-8 hidden md:block">
                  <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      Sistem Absensi
                    </h1>
                    <p className="text-gray-600">
                      Pantau dan kelola data kehadiran setiap acara secara akurat dan efisien.
                    </p>
                  </div>
                </div>

                {/* Centered empty card like user page */}
                <div className="flex-1">
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{attendanceData.length === 0 ? "Belum ada data absensi" : "Tidak ada data yang cocok ditemukan"}</h3>
                    <p className="text-gray-500 mb-4">{error || (attendanceData.length === 0 ? "Mulai dengan mengisi absensi" : "Coba ubah filter pencarian Anda")}</p>
                    {attendanceData.length === 0 && (
                      <a
                        href="/attendance/data"
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md"
                      >
                        Isi Absensi Pertama
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AuthenticatedLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex w-full overflow-x-hidden">
          <div className="flex-1 min-w-0">
            <div className="p-3 sm:p-4 md:p-6 w-full max-w-full">
          <div className="mx-auto w-full px-0 sm:px-0">
            {/* Header - hidden on mobile, shown on desktop */}
            <div className="mb-8 hidden md:block">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-white/20">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                   Sistem Absensi
                </h1>
                <p className="text-gray-600">
                  Pantau dan kelola data kehadiran setiap acara secara akurat dan efisien.
                </p>
                
                {/* Note: Tanggal dan Waktu Saat Ini */}
                <div className="mt-4 p-3 bg-blue-50/80 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-sm text-blue-800">
                    <FiClock className="mr-2 flex-shrink-0" />
                    <span className="font-medium">Waktu saat ini:</span>
                    <span className="ml-2">{currentDateTime}</span>
                  </div>
                </div>
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
                      <option value="ready">Sudah Siap</option>
                      <option value="finish">Telah selesai</option>
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

              {/* Note: Tanggal dan Waktu untuk Mobile */}
              <div className="mt-4 md:hidden p-3 bg-blue-50/80 border border-blue-200 rounded-lg">
                <div className="flex items-center text-sm text-blue-800">
                  <FiClock className="mr-2 flex-shrink-0" />
                  <span className="font-medium">Waktu saat ini:</span>
                  <span className="ml-2 text-xs">{currentDateTime}</span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {filteredData.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {attendanceData.length === 0
                      ? "Belum ada data absensi"
                      : "Tidak ada data yang cocok ditemukan"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {attendanceData.length === 0
                      ? "Mulai dengan mengisi absensi"
                      : "Coba ubah filter pencarian Anda"}
                  </p>
                  {attendanceData.length === 0 && (
                    <a
                      href="/attendance/data"
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md"
                    >
                      Isi Absensi Pertama
                    </a>
                  )}
                </div>
              ) : (
                <>
                  {/* Mobile Card List (visible on small screens) */}
                  <div className="space-y-3 md:hidden">
                    {currentItems.map((record, idx) => (
                      <div
                        key={record.id}
                        className="bg-white rounded-xl shadow-sm p-4"
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0">
                            <img
                              src={
                                record.photo.startsWith("http")
                                  ? record.photo
                                  : record.photo.length > 100 && !record.photo.startsWith("data:")
                                  ? `data:image/jpeg;base64,${record.photo}`
                                  : record.photo || "/images/employee1.jpg"
                              }
                              alt={record.name}
                              className="h-full w-full object-cover cursor-pointer"
                              onClick={() => {
                                setPreviewSrc(
                                  record.photo.startsWith("http")
                                    ? record.photo
                                    : record.photo.length > 100 && !record.photo.startsWith("data:")
                                    ? `data:image/jpeg;base64,${record.photo}`
                                    : record.photo
                                );
                                setPreviewName(record.name || String(record.id));
                                setPreviewOpen(true);
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/employee1.jpg";
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">{record.name}</div>
                              <div className="text-xs text-gray-500">{record.date}</div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">{record.time}</div>
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(record.status)}`}>
                                {record.status === "ready" && "Sudah siap"}
                                {record.status === "finish" && "Telah selesai"}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Catatan section untuk mobile */}
                        {record.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-start gap-2">
                              <FiFileText className="text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 mb-1">Catatan:</p>
                                <p className="text-sm text-gray-700 break-words">
                                  {shouldTruncateNotes(record.notes) 
                                    ? `${truncateNotes(record.notes)}...` 
                                    : record.notes}
                                </p>
                                {shouldTruncateNotes(record.notes) && (
                                  <button
                                    onClick={() => {
                                      setSelectedNotes(record.notes || "");
                                      setSelectedName(record.name);
                                      setNotesModalOpen(true);
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700 mt-1 font-medium"
                                  >
                                    Lihat selengkapnya
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop/Table view (visible on md+) */}
                  <div className="hidden md:block">
                    {/* Attendance Table */}
                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden border border-white/20 w-full">
                      <div className="overflow-x-auto w-full">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Foto</th>
                              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama Karyawan</th>
                              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tanggal</th>
                              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Waktu</th>
                              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                              <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catatan</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white/60 backdrop-blur-sm divide-y divide-gray-100">
                            {currentItems.map((record, index) => (
                              <tr key={record.id} className="hover:bg-white/80 transition-all duration-200">
                                <td className="px-3 md:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-700">{indexOfFirstItem + index + 1}</td>
                                <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 shadow-md ring-2 ring-white">
                                    {record.photo ? (
                                      <img
                                        className="h-full w-full object-cover cursor-pointer"
                                        src={record.photo.startsWith("http") ? record.photo : record.photo.length > 100 && !record.photo.startsWith("data:") ? `data:image/jpeg;base64,${record.photo}` : record.photo}
                                        alt={record.name}
                                        onClick={() => {
                                          setPreviewSrc(record.photo.startsWith("http") ? record.photo : record.photo.length > 100 && !record.photo.startsWith("data:") ? `data:image/jpeg;base64,${record.photo}` : record.photo);
                                          setPreviewName(record.name || String(record.id));
                                          setPreviewOpen(true);
                                        }}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = "/images/employee1.jpg";
                                        }}
                                      />
                                    ) : (
                                      <img className="h-full w-full object-cover" src="/images/employee1.jpg" alt="default" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 md:px-4 py-4 whitespace-nowrap max-w-[120px] md:max-w-none truncate">
                                  <div className="text-sm font-semibold text-gray-900 truncate">{record.name}</div>
                                </td>
                                <td className="px-3 md:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{record.date}</td>
                                <td className="px-3 md:px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{record.time}</td>
                                <td className="px-3 md:px-4 py-4 whitespace-nowrap">
                                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm ${getStatusColor(record.status)}`}>
                                    {record.status === "ready" && "Sudah siap"}
                                    {record.status === "finish" && "Telah selesai"}
                                  </span>
                                </td>
                                <td className="px-3 md:px-4 py-4 max-w-xs">
                                  {record.notes ? (
                                    <div className="flex items-start gap-2">
                                      <FiFileText className="text-blue-500 mt-0.5 flex-shrink-0" size={14} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-700 break-words">
                                          {shouldTruncateNotes(record.notes) 
                                            ? `${truncateNotes(record.notes)}...` 
                                            : record.notes}
                                        </p>
                                        {shouldTruncateNotes(record.notes) && (
                                          <button
                                            onClick={() => {
                                              setSelectedNotes(record.notes || "");
                                              setSelectedName(record.name);
                                              setNotesModalOpen(true);
                                            }}
                                            className="text-xs text-blue-600 hover:text-blue-700 mt-1 font-medium hover:underline"
                                          >
                                            Selengkapnya
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-400 italic">-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Pagination Footer */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-2">
                        <nav className="flex items-center space-x-1" aria-label="Pagination">
                          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm"}`}>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                            <button key={number} onClick={() => setCurrentPage(number)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === number ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm"}`}>{number}</button>
                          ))}

                          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-sm"}`}>
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                          </button>
                        </nav>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white rounded-2xl shadow-2xl w-11/12 sm:w-[420px] p-5 sm:p-6 border border-gray-200 animate-scaleIn">
            
            {/* Tombol close */}
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
              onClick={() => setPreviewOpen(false)}
              aria-label="Tutup preview"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Judul foto */}
            <h2 className="text-lg font-semibold text-gray-800 mb-3 text-center">
              Preview Foto
            </h2>

            {/* Gambar */}
            <div className="flex justify-center mb-5">
              <img
                src={previewSrc}
                alt={previewName}
                className="max-w-full max-h-[70vh] object-contain rounded-lg border border-gray-200 shadow-sm"
              />
            </div>

            {/* Tombol download */}
            <div className="flex justify-center">
              <a
                href={previewSrc}
                download={`foto-${previewName}.jpg`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              >
                <FiDownload className="w-5 h-5" />
                Download Foto
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Notes Detail Modal */}
{notesModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn p-4">
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-gray-200 animate-scaleIn max-h-[85vh] overflow-hidden flex flex-col">
      
      {/* Tombol close */}
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
        onClick={() => setNotesModalOpen(false)}
        aria-label="Tutup catatan"
      >
        <FiX className="w-6 h-6" />
      </button>

      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pr-8">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FiFileText className="text-blue-600 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-800 leading-tight">
            Catatan Lengkap
          </h2>
          <p className="text-sm text-gray-500">{selectedName}</p>
        </div>
      </div>

      {/* Konten Catatan */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words">
          {selectedNotes || "Tidak ada catatan tersedia."}
        </p>
      </div>

      {/* Tombol Footer */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setNotesModalOpen(false)}
          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
)}


        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}