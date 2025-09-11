"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

// Placeholder for toast notifications
const toast = {
  success: (message: string) => console.log("Sukses:", message),
  error: (message: string) => console.error("Error:", message),
};

// Type definitions
type Tool = {
  id: string;
  item_name: string;
  stock: number;
  item_condition: string;
  category: string;
};

type BorrowRecord = {
  log_tools: string;
  user: string;
  item_name: string;
  quantity: number;
  date_borrow: string;
  date_return: string | null;
  tools_status: "borrowed" | "return";
  user_id: string;
  tools_id: string;
};

type GroupedBorrowRecord = {
  user: string;
  user_id: string;
  date_borrow: string;
  date_return: string | null;
  tools_status: "borrowed" | "return";
  items: {
    log_tools: string;
    item_name: string;
    quantity: number;
    tools_id: string;
  }[];
};

// Axios instance dengan interceptor untuk menambahkan token
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://192.168.110.193:8080",
    timeout: 10000,
  });

  instance.interceptors.request.use((config) => {
    // Mengambil token dari localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.error("Token tidak ditemukan di localStorage");
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        toast.error("Sesi kedaluwarsa. Silakan login kembali.");
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Table Row Component
function BorrowTableRow({
  record,
}: {
  record: GroupedBorrowRecord;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleReturn = () => {
    // Navigasi ke halaman edit dengan membawa data yang diperlukan
    const logToolsIds = record.items.map(item => item.log_tools);
    router.push(`/log_tools/edit?id=${logToolsIds.join(',')}`);
  };

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-medium text-gray-900">
            {record.items.length} alat
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="ml-2 text-blue-600 text-sm"
            >
              {isExpanded ? "▲ Sembunyikan" : "▼ Lihat Detail"}
            </button>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-gray-700">{record.user}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-gray-700">
            {record.items.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-gray-700">
            {new Date(record.date_borrow).toLocaleDateString()}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-gray-700">
            {record.date_return
              ? new Date(record.date_return).toLocaleDateString()
              : "-"}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              record.tools_status === "borrowed"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {record.tools_status === "borrowed" ? "Dipinjam" : "Dikembalikan"}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          {record.tools_status === "borrowed" && (
            <button
              onClick={handleReturn}
              className="text-blue-600 hover:text-blue-900"
            >
              Tandai Dikembalikan
            </button>
          )}
        </td>
      </tr>
      {isExpanded &&
        record.items.map((item, index) => (
          <tr key={item.log_tools} className="bg-gray-50">
            <td className="px-6 py-2 pl-10 text-sm text-gray-500">
              {index + 1}. {item.item_name}
            </td>
            <td className="px-6 py-2 text-sm text-gray-500"></td>
            <td className="px-6 py-2 text-sm text-gray-500">{item.quantity}</td>
            <td className="px-6 py-2 text-sm text-gray-500"></td>
            <td className="px-6 py-2 text-sm text-gray-500"></td>
            <td className="px-6 py-2 text-sm text-gray-500"></td>
            <td className="px-6 py-2 text-sm text-gray-500"></td>
          </tr>
        ))}
    </>
  );
}

// Main Component
export default function ToolBorrowingSystem() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [groupedRecords, setGroupedRecords] = useState<GroupedBorrowRecord[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const router = useRouter();

  // Create API instance with interceptors
  const api = createApiInstance();

  // Fungsi untuk mengelompokkan data peminjaman berdasarkan user dan tanggal
  const groupBorrowRecords = (
    records: BorrowRecord[]
  ): GroupedBorrowRecord[] => {
    const groupedMap: {[key: string]: GroupedBorrowRecord} = {};

    records.forEach((record) => {
      const key = `${record.user_id}-${record.date_borrow}`;
      
      if (!groupedMap[key]) {
        groupedMap[key] = {
          user: record.user,
          user_id: record.user_id,
          date_borrow: record.date_borrow,
          date_return: record.date_return,
          tools_status: record.tools_status,
          items: []
        };
      }
      
      groupedMap[key].items.push({
        log_tools: record.log_tools,
        item_name: record.item_name,
        quantity: record.quantity,
        tools_id: record.tools_id,
      });
    });

    return Object.values(groupedMap);
  };

  // Fetch tools and borrow records
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tools
        const toolsRes = await api.get("/data2");
        let toolsData = toolsRes.data;

        // Handle different response structures
        if (toolsData && typeof toolsData === "object") {
          if (Array.isArray(toolsData.data)) {
            toolsData = toolsData.data;
          } else if (Array.isArray(toolsData)) {
            // Jika response langsung array
            toolsData = toolsData;
          }
        }

        const processedTools: Tool[] = Array.isArray(toolsData)
          ? toolsData.map((tool: any, index: number) => ({
              id: tool.id?.toString() || `generated-${index}-${Date.now()}`,
              item_name: tool.item_name || "No name",
              stock: tool.stock || 0,
              item_condition: tool.item_condition || "",
              category: tool.category || "Lainnya",
            }))
          : [];

        setTools(processedTools);

        // Fetch borrow records
        const recordsRes = await api.get("/data3");
        let recordsData = recordsRes.data;

        // Handle different response structures
        if (recordsData && typeof recordsData === "object") {
          if (Array.isArray(recordsData.data)) {
            recordsData = recordsData.data;
          } else if (Array.isArray(recordsData)) {
            recordsData = recordsData;
          }
        }

        const mappedRecords: BorrowRecord[] = Array.isArray(recordsData)
          ? recordsData.map((record: any) => ({
              log_tools:
                record.log_tools?.toString() || `generated-${Date.now()}`,
              user_id: record.user_id?.toString() || "0",
              user: record.user || "Unknown User",
              tools_id: record.tools_id?.toString() || "0",
              item_name: record.item_name || "Unknown Tool",
              quantity: record.quantity || 0,
              date_borrow: record.date_borrow || new Date().toISOString(),
              date_return: record.date_return || null,
              tools_status:
                record.tools_status === "return" ? "return" : "borrowed",
            }))
          : [];

        setBorrowRecords(mappedRecords);
        setGroupedRecords(groupBorrowRecords(mappedRecords));
      } catch (err) {
        console.error("Kesalahan pengambilan data:", err);
        let errorMessage = "Gagal memuat data.";
        if (axios.isAxiosError(err)) {
          if (err.code === "ERR_NETWORK") {
            errorMessage =
              "Kesalahan Jaringan: Tidak dapat terhubung ke server API. Pastikan server backend berjalan di " +
              api.defaults.baseURL;
          } else if (err.response) {
            errorMessage = `Kesalahan API: ${err.response.status} - ${
              err.response.data?.message || err.message
            }`;
          } else {
            errorMessage = err.message;
          }
        } else if (err instanceof Error) {
          errorMessage = err.message;
        }
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredRecords = groupedRecords.filter(
    (record) =>
      record.user.toLowerCase().includes(search.toLowerCase()) ||
      record.items.some((item) =>
        item.item_name.toLowerCase().includes(search.toLowerCase())
      ) ||
      record.tools_status.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / itemsPerPage)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-600">Memuat data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow-md max-w-md w-full text-center">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="p-8 bg-gray-50 min-h-screen">
          {/* Container utama dengan lebar maksimum untuk desktop */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  Sistem Peminjaman Alat
                </h1>
                <p className="text-gray-500">
                  Kelola peminjaman dan pengembalian alat
                </p>
              </div>
              <div className="mb-4 md:mb-0 md:ml-4 flex justify-end gap-3">
                <Link
                  href="/tools"
                  className="px-5 py-2.5 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 flex items-center"
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
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Kembali ke Alat
                </Link>
                <Link
                  href="/log_tools/add"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
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
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Pinjam Alat
                </Link>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari catatan..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {groupedRecords.length === 0
                    ? "Tidak ada catatan peminjaman ditemukan"
                    : "Tidak ada catatan yang cocok ditemukan"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {groupedRecords.length === 0
                    ? "Mulai dengan meminjam alat"
                    : "Coba istilah pencarian yang berbeda"}
                </p>
                {groupedRecords.length === 0 && (
                  <Link
                    href="/log_tools/add"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Pinjam Alat Pertama
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Alat
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Peminjam
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Jumlah
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Tanggal Pinjam
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Tanggal Kembali
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((record, index) => (
                          <BorrowTableRow
                            key={`${record.user_id}-${record.date_borrow}-${index}`}
                            record={record}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-l-md border ${
                          currentPage === 1
                            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        Sebelumnya
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (number) => (
                          <button
                            key={number}
                            onClick={() => setCurrentPage(number)}
                            className={`px-4 py-2 border ${
                              currentPage === number
                                ? "bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {number}
                          </button>
                        )
                      )}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-r-md border ${
                          currentPage === totalPages
                            ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        Berikutnya
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}