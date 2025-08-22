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
  tools_status: "borrowed" | "returned";
  user_id: string;
  tools_id: string;
};

type BorrowFormData = {
  user_id: string;
  tools_id: string;
  quantity: number;
  date_borrow: string;
  date_return: string | null;
  tools_status: "borrowed";
};

// Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  timeout: 30000,
});
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
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

// Table Row Component
function BorrowTableRow({
  record,
  onReturn,
}: {
  record: BorrowRecord;
  onReturn?: (id: string) => void;
}) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{record.item_name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-700">{record.user}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-700">{record.quantity}</div>
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
          {record.tools_status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {record.tools_status === "borrowed" && onReturn && (
          <button
            onClick={() => onReturn(record.log_tools)}
            className="text-blue-600 hover:text-blue-900"
          >
            Tandai Dikembalikan
          </button>
        )}
      </td>
    </tr>
  );
}

// Borrow Form Modal
function BorrowFormModal({
  tools,
  onBorrow,
  onCancel,
}: {
  tools: Tool[];
  onBorrow: (data: BorrowFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<BorrowFormData>({
    user_id: "1", // Default user ID, bisa diganti dengan user yang sedang login
    tools_id: tools.length > 0 ? tools[0].id : "",
    quantity: 1,
    date_borrow: new Date().toISOString().split("T")[0],
    date_return: null,
    tools_status: "borrowed",
  });

  const [availableQuantities, setAvailableQuantities] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    const quantities = tools.reduce((acc, tool) => {
      acc[tool.id] = tool.stock;
      return acc;
    }, {} as { [key: string]: number });
    setAvailableQuantities(quantities);
    if (tools.length > 0 && formData.tools_id === "") {
      setFormData((prev) => ({ ...prev, tools_id: tools[0].id }));
    }
  }, [tools]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "quantity") {
        let qty = parseInt(value);
        if (isNaN(qty) || qty < 1) qty = 1;
        const selected = tools.find((t) => t.id === (prev.tools_id || ""));
        const maxQty = selected ? selected.stock : 1;
        if (qty > maxQty) qty = maxQty;
        return { ...prev, quantity: qty };
      } else if (name === "tools_id") {
        return { ...prev, tools_id: value, quantity: 1 };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBorrow(formData);
  };

  const selectedTool = tools.find((tool) => tool.id === formData.tools_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-5 text-white">
          <h2 className="text-xl font-semibold">Pinjam Alat</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alat
            </label>
            <select
              name="tools_id"
              value={formData.tools_id}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Pilih Alat</option>
              {tools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.item_name} - Tersedia: {tool.stock}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah
            </label>
            <input
              type="number"
              name="quantity"
              min="1"
              max={selectedTool ? selectedTool.stock : 1}
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {selectedTool && (
              <p className="text-xs text-gray-500 mt-1">
                Tersedia: {selectedTool.stock}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Peminjaman
            </label>
            <input
              type="date"
              name="date_borrow"
              value={formData.date_borrow}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Pinjam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Component
export default function ToolBorrowingSystem() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const router = useRouter();

  // Fetch tools and borrow records
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tools
        const toolsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/data2`
        );
        let toolsData = toolsRes.data;

        // Handle different response structures
        if (toolsData && typeof toolsData === "object") {
          if (Array.isArray(toolsData.data)) {
            toolsData = toolsData.data;
          }
        }

        const processedTools: Tool[] = toolsData.map(
          (tool: any, index: number) => ({
            id: tool.id?.toString() || `generated-${index}-${Date.now()}`,
            item_name: tool.item_name || "No name",
            stock: tool.stock || 0,
            item_condition: tool.item_condition || "",
            category: tool.category || "Lainnya",
          })
        );

        setTools(processedTools);

        // Fetch borrow records
        const recordsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/data3`
        );
        let recordsData = recordsRes.data;

        // Handle different response structures
        if (recordsData && typeof recordsData === "object") {
          if (Array.isArray(recordsData.data)) {
            recordsData = recordsData.data;
          }
        }

        const mappedRecords: BorrowRecord[] = recordsData.map(
          (record: any) => ({
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
              record.tools_status === "returned" ? "returned" : "borrowed",
          })
        );

        setBorrowRecords(mappedRecords);
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

  const handleBorrowTool = async (data: BorrowFormData) => {
    try {
      const toolToUpdate = tools.find((tool) => tool.id === data.tools_id);
      if (!toolToUpdate) {
        toast.error("Alat tidak ditemukan.");
        return;
      }

      if (toolToUpdate.stock < data.quantity) {
        toast.error("Jumlah tidak cukup tersedia.");
        return;
      }

      const payload = {
        user_id: data.user_id,
        tools_id: data.tools_id,
        quantity: data.quantity,
        date_borrow: data.date_borrow,
        date_return: null,
        tools_status: "borrowed",
      };

      // Kirim permintaan untuk meminjam alat
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/data3`,
        payload
      );

      if (response.data && response.data.status === false) {
        toast.error(response.data.message || "Gagal meminjam alat.");
        return;
      }

      // Update stok alat
      const updateToolResponse = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/data2/${data.tools_id}`,
        {
          ...toolToUpdate,
          stock: toolToUpdate.stock - data.quantity,
        }
      );

      if (updateToolResponse.data && updateToolResponse.data.status === false) {
        toast.error(
          updateToolResponse.data.message || "Gagal memperbarui stok alat."
        );
        return;
      }

      setShowBorrowModal(false);
      toast.success("Alat berhasil dipinjam!");

      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error("Kesalahan saat meminjam alat:", err);
      let errorMessage = "Gagal meminjam alat.";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMessage = `API: ${err.response.data.message}`;
        } else if (err.response) {
          errorMessage = `API: ${err.response.status} - ${err.response.statusText}`;
        } else {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleReturnTool = async (id: string) => {
    try {
      const recordToReturn = borrowRecords.find(
        (record) => record.log_tools === id
      );
      if (!recordToReturn) {
        toast.error("Catatan peminjaman tidak ditemukan.");
        return;
      }

      const payload = {
        user_id: recordToReturn.user_id,
        tools_id: recordToReturn.tools_id,
        quantity: recordToReturn.quantity,
        date_borrow: recordToReturn.date_borrow,
        date_return: new Date().toISOString().split("T")[0],
        tools_status: "returned",
      };

      // Update status peminjaman
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/data2/${id}`, payload);

      if (response.data && response.data.status === false) {
        toast.error(response.data.message || "Gagal mengembalikan alat.");
        return;
      }

      // Kembalikan stok alat
      const toolToUpdate = tools.find(
        (tool) => tool.id === recordToReturn.tools_id
      );
      if (toolToUpdate) {
        const updateToolResponse = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/data2/${recordToReturn.tools_id}`,
          {
            ...toolToUpdate,
            stock: toolToUpdate.stock + recordToReturn.quantity,
          }
        );

        if (
          updateToolResponse.data &&
          updateToolResponse.data.status === false
        ) {
          toast.error(
            updateToolResponse.data.message || "Gagal mengembalikan stok alat."
          );
          return;
        }
      }

      // Update state lokal
      setBorrowRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.log_tools === id
            ? {
                ...record,
                date_return: payload.date_return,
                tools_status: "returned",
              }
            : record
        )
      );

      if (toolToUpdate) {
        setTools((prevTools) =>
          prevTools.map((tool) =>
            tool.id === recordToReturn.tools_id
              ? { ...tool, stock: tool.stock + recordToReturn.quantity }
              : tool
          )
        );
      }

      toast.success("Alat berhasil dikembalikan!");
    } catch (err) {
      console.error("Kesalahan saat mengembalikan alat:", err);
      let errorMessage = "Gagal mengembalikan alat.";
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMessage = `API: ${err.response.data.message}`;
        } else if (err.response) {
          errorMessage = `API: ${err.response.status} - ${err.response.statusText}`;
        } else {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  const filteredRecords = borrowRecords.filter(
    (record) =>
      record.user.toLowerCase().includes(search.toLowerCase()) ||
      record.item_name.toLowerCase().includes(search.toLowerCase()) ||
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
              <button
                onClick={() => setShowBorrowModal(true)}
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
              </button>
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
                  ? "Tidak ada catatan peminjaman ditemukan"
                  : "Tidak ada catatan yang cocok ditemukan"}
              </h3>
              <p className="text-gray-500 mb-4">
                {borrowRecords.length === 0
                  ? "Mulai dengan meminjam alat"
                  : "Coba istilah pencarian yang berbeda"}
              </p>
              {borrowRecords.length === 0 && (
                <button
                  onClick={() => setShowBorrowModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Pinjam Alat Pertama
                </button>
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
                      {currentItems.map((record) => (
                        <BorrowTableRow
                          key={record.log_tools}
                          record={record}
                          onReturn={
                            record.tools_status === "borrowed"
                              ? handleReturnTool
                              : undefined
                          }
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
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
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

          {showBorrowModal && (
            <BorrowFormModal
              tools={tools}
              onBorrow={handleBorrowTool}
              onCancel={() => setShowBorrowModal(false)}
            />
          )}
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
