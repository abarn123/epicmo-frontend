"use client";
import Sidebar from "../components/Sidebar";
import { FiSearch, FiDownload, FiCalendar, FiFilter } from "react-icons/fi";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface AttendanceRecord {
  id: number;
  photo: string;
  name: string;
  date: string;
  time: string;
  status: "present" | "late" | "absent" | "leave";
}

export default function AttendancePage() {
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
      if (timeString.includes('T')) {
        const date = new Date(timeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      // Jika format HH:MM:SS
      else if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) {
        const [hours, minutes] = timeString.split(':');
        return `${hours}:${minutes}`;
      }
      // Jika format timestamp
      else if (!isNaN(Number(timeString))) {
        const date = new Date(Number(timeString));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        const response = await axios.get("http://192.168.110.100:8080/data4");
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
              date: dateFromAPI ? new Date(dateFromAPI).toLocaleDateString() : "-",
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
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "leave":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fungsi untuk filter data
  const filteredData = attendanceData.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? record.date === new Date(filterDate).toLocaleDateString() : true;
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-lg">Loading attendance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
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
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex">
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 ml-0">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Attendance Records
            </h1>
            <p className="text-gray-600">Employee attendance monitoring system</p>
          </div>

          {/* Toolbar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  className="block pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiFilter className="text-gray-400" />
                </div>
                <select
                  className="block pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="present">Present</option>
                  <option value="sick">Sick</option>
                  <option value="permission">Permission</option>
                </select>
              </div>

              <a
                href="/attendance/data"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FiDownload className="mr-2" />
                Isi Absen
              </a>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photo
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                              record.status
                            )}`}
                          >
                            {record.status.charAt(0).toUpperCase() +
                              record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 rounded-lg shadow-sm">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, totalItems)}
                    </span>{" "}
                    of <span className="font-medium">{totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      &larr;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => setCurrentPage(number)}
                          className={`inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === number
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {number}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}