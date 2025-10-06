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
  transaction_id: string;
  user: string;
  user_id: string;
  tools_id: string;
  item_name: string;
  quantity: number;
  date_borrow: string;
  date_return: string | null;
  status: "pending" | "borrowed" | "return";
  reason?: string;
};

type GroupedBorrowRecord = {
  transaction_id: string;
  user: string;
  user_id: string;
  date_borrow: string;
  date_return: string | null;
  status: "pending" | "borrowed" | "return";
  reason?: string;
  items: {
    log_tools: string;
    tools_id: string;
    item_name: string;
    quantity: number;
  }[];
};

// Table Row Component for grouped records
function BorrowTableRow({
  record,
  refresh,
}: {
  record: GroupedBorrowRecord;
  refresh: () => void;
}) {
  // Approve peminjaman
  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/data3/approve/${record.transaction_id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Peminjaman disetujui");
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyetujui peminjaman");
    }
  };

  // Reject peminjaman
  const handleReject = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/data3/reject/${record.transaction_id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Peminjaman ditolak");
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menolak peminjaman");
    }
  };
  const router = useRouter();
  const [showItems, setShowItems] = useState(false);
  // Ambil role dari AuthContext
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // @ts-ignore
  const { role } = require("../context/AuthContext").useAuth();

  const handleReturn = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/data3/${record.transaction_id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Alat berhasil dikembalikan");
      refresh(); // reload data setelah update
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengembalikan alat");
    }
  };

  const toggleShowItems = () => {
    setShowItems(!showItems);
  };

  // Badge status
  const getStatusBadge = (status: string) => {
    if (status === "pending")
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
          Pending
        </span>
      );
    if (status === "borrowed")
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          Dipinjam
        </span>
      );
    if (status === "return")
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          Dikembalikan
        </span>
      );
    if (status === "rejected")
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          Ditolak
        </span>
      );
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600">
        -
      </span>
    );
  };

  // Kolom alasan (untuk admin, bisa tambahkan role check jika perlu)
  // ...existing code...

  return (
    <>
      <tr className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <button
            onClick={toggleShowItems}
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg
              className={`w-4 h-4 mr-2 transform transition-transform ${
                showItems ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            {record.items.length} alat
          </button>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-medium text-gray-900">{record.user}</div>
        </td>
        {/* Hapus kolom jumlah */}
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
          {getStatusBadge(record.status)}
        </td>
        {/* Kolom alasan peminjaman untuk admin */}
        <td
          className="px-6 py-4 text-gray-700 max-w-xs min-w-[120px] w-[220px]"
          style={{ maxWidth: 300, minWidth: 120, width: 220 }}
        >
          <div
            className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            style={{ maxWidth: 220 }}
          >
            <span className="block truncate whitespace-nowrap">
              {record.reason || "-"}
            </span>
          </div>
        </td>
        <td
          className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium w-32"
          style={{ width: 96 }}
        >
          {record.status === "pending" && role === "admin" ? (
            <>
              <button
                onClick={handleApprove}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 mr-2"
              >
                Setujui
              </button>
              <button
                onClick={handleReject}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                Tolak
              </button>
            </>
          ) : record.status === "borrowed" ? (
            <button
              onClick={handleReturn}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Kembalikan
            </button>
          ) : null}
        </td>
      </tr>
      {showItems &&
        record.items.map((item, index) => (
          <tr
            key={`${item.log_tools}-${index}`}
            className="border-b border-gray-200 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            <td className="px-6 py-4 whitespace-nowrap pl-12">
              <div className="text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                {item.item_name}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
            {/* Hapus kolom jumlah pada detail alat */}
            <td className="px-6 py-4 whitespace-nowrap"></td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
            <td className="px-6 py-4 whitespace-nowrap"></td>
          </tr>
        ))}
    </>
  );
}

// Main Component
export default function ToolBorrowingSystem() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<GroupedBorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Group records by transaction_id
  const groupRecords = (records: BorrowRecord[]): GroupedBorrowRecord[] => {
    const grouped: Record<string, GroupedBorrowRecord> = {};
    records.forEach((record) => {
      if (!grouped[record.transaction_id]) {
        grouped[record.transaction_id] = {
          transaction_id: record.transaction_id,
          user: record.user,
          user_id: record.user_id,
          date_borrow: record.date_borrow,
          date_return: record.date_return,
          status: record.status,
          reason: record.reason, // ambil reason dari parent transaksi
          items: [],
        };
      }
      grouped[record.transaction_id].items.push({
        log_tools: record.log_tools,
        tools_id: record.tools_id,
        item_name: record.item_name,
        quantity: record.quantity,
      });
    });
    return Object.values(grouped);
  };

  // Fetch tools and borrow records
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan di localStorage");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch tools
      const toolsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/data2`,
        {
          headers,
          timeout: 10000,
        }
      );
      let toolsData = toolsRes.data;

      if (toolsData && typeof toolsData === "object") {
        if (Array.isArray(toolsData.data)) {
          toolsData = toolsData.data;
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
      const recordsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/data3`,
        {
          headers,
          timeout: 10000,
        }
      );
      let recordsData = recordsRes.data;

      if (recordsData && typeof recordsData === "object") {
        if (Array.isArray(recordsData.data)) {
          recordsData = recordsData.data;
        }
      }

      const mappedRecords: BorrowRecord[] = Array.isArray(recordsData)
        ? recordsData.flatMap((record: any) =>
            (record.items || []).map((item: any) => ({
              log_tools:
                record.transaction_id?.toString() || `generated-${Date.now()}`,
              transaction_id: record.transaction_id?.toString() || "0",
              user_id: record.user_id?.toString() || "0",
              user: record.user || "Unknown User",
              tools_id: item.tools_id?.toString() || "0",
              item_name: item.item_name || "Unknown Tool",
              quantity: item.quantity || 0,
              date_borrow: record.date_borrow || new Date().toISOString(),
              date_return: record.date_return || null,
              status: record.status, // ambil status langsung dari backend
              reason: record.reason, // ambil reason dari parent transaksi
            }))
          )
        : [];

      // Group records by transaction_id
      const groupedRecords = groupRecords(mappedRecords);
      setBorrowRecords(groupedRecords);
    } catch (err: any) {
      console.error("Kesalahan pengambilan data:", err);
      let errorMessage = "Gagal memuat data.";
      if (axios.isAxiosError(err)) {
        if (err.code === "ERR_NETWORK") {
          errorMessage =
            "Kesalahan Jaringan: Tidak dapat terhubung ke server API. Pastikan server backend berjalan di " +
            process.env.NEXT_PUBLIC_API_URL;
        } else if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          errorMessage = "Sesi kedaluwarsa. Silakan login kembali.";
          toast.error(errorMessage);
        } else if (err.response?.status === 403) {
          errorMessage =
            "Akses ditolak. Anda tidak memiliki izin untuk mengakses data ini.";
          toast.error(errorMessage);
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

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRecords = borrowRecords.filter(
    (record) =>
      record.user.toLowerCase().includes(search.toLowerCase()) ||
      record.items.some((item) =>
        item.item_name.toLowerCase().includes(search.toLowerCase())
      ) ||
      record.status.toLowerCase().includes(search.toLowerCase())
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

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
  <div className="bg-gray-50 min-h-screen ml-56 py-8">
          <div>
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
                  placeholder="Cari berdasarkan peminjam, alat, atau status..."
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
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {borrowRecords.length === 0
                    ? "Belum ada data peminjaman"
                    : "Tidak ada data yang cocok ditemukan"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {borrowRecords.length === 0
                    ? "Mulai dengan meminjam alat"
                    : "Coba istilah pencarian yang berbeda"}
                </p>
                {borrowRecords.length === 0 && (
                  <Link
                    href="/log_tools/add"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Pinjam Alat Pertama
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col min-h-[500px]">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg flex-grow">
                  <div>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Alat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Peminjam
                          </th>
                          {/* Hapus header kolom jumlah */}
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal Pinjam
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal Kembali
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[120px] min-w-[80px] w-[120px]"
                            style={{ minWidth: 80, maxWidth: 120, width: 120 }}
                          >
                            Alasan
                          </th>
                          <th
                            className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                            style={{ width: 96 }}
                          >
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {currentItems.map((record, index) => (
                          <BorrowTableRow
                            key={`${record.transaction_id}-${index}`}
                            record={record}
                            refresh={fetchData}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
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
                        Selanjutnya
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
