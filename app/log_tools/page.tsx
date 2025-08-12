"use client";
import React, { useState, useEffect } from "react";
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
  id: number;
  item_name: string;
  item_status: string;
  quantity: number;
  category: string;
};

type BorrowRecord = {
  id: number;
  user_id: number;
  user_name: string;
  tool_id: number;
  tool_name: string;
  quantity: number;
  borrow_date: string;
  return_date: string | null;
  status: "borrowed" | "returned";
};

type BorrowFormData = {
  user_id: number;
  tool_id: number;
  quantity: number;
  borrow_date: string;
  return_date: string | null;
};

// Axios instance
const api = axios.create({
  baseURL: "http://192.168.110.100:8080",
  timeout: 10000,
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
      toast.error("Sesi kedaluwarsa. Silakan login kembali.");
    }
    return Promise.reject(error);
  }
);

// Mock tools data
const mockTools: Tool[] = [
  {
    id: 101,
    item_name: "Kamera Canon",
    item_status: "Available",
    quantity: 10,
    category: "Electronics",
  },
  {
    id: 102,
    item_name: "Kain Warna Merah",
    item_status: "Available",
    quantity: 15,
    category: "Textiles",
  },
  {
    id: 103,
    item_name: "Tripod",
    item_status: "Available",
    quantity: 5,
    category: "Photography",
  },
  {
    id: 104,
    item_name: "Lensa Zoom",
    item_status: "Available",
    quantity: 3,
    category: "Photography",
  },
];

// Table Row Component
function BorrowTableRow({
  record,
  onReturn,
}: {
  record: BorrowRecord;
  onReturn?: (id: number) => void;
}) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{record.tool_name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-700">{record.user_name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-700">{record.quantity}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-700">
          {new Date(record.borrow_date).toLocaleDateString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-gray-700">
          {record.return_date
            ? new Date(record.return_date).toLocaleDateString()
            : "-"}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            record.status === "borrowed"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {record.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        {record.status === "borrowed" && onReturn && (
          <button
            onClick={() => onReturn(record.id)}
            className="text-blue-600 hover:text-blue-900"
          >
            Tandai Dikembalikan
          </button>
        )}
      </td>
    </tr>
  );
}

// Borrow Form Modal (unchanged from your original)
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
    user_id: 1,
    tool_id: tools.length > 0 ? tools[0].id : 0,
    quantity: 1,
    borrow_date: new Date().toISOString().split("T")[0],
    return_date: null,
  });

  const [availableQuantities, setAvailableQuantities] = useState<{
    [key: number]: number;
  }>({});

  useEffect(() => {
    const quantities = tools.reduce((acc, tool) => {
      acc[tool.id] = tool.quantity;
      return acc;
    }, {} as { [key: number]: number });
    setAvailableQuantities(quantities);
    if (tools.length > 0 && formData.tool_id === 0) {
      setFormData((prev) => ({ ...prev, tool_id: tools[0].id }));
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
        const selected = tools.find((t) => t.id === (prev.tool_id || 0));
        const maxQty = selected ? selected.quantity : 1;
        if (qty > maxQty) qty = maxQty;
        return { ...prev, quantity: qty };
      } else if (name === "tool_id") {
        return { ...prev, tool_id: parseInt(value), quantity: 1 };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBorrow(formData);
  };

  const selectedTool = tools.find((tool) => tool.id === formData.tool_id);

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
              name="tool_id"
              value={formData.tool_id}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Pilih Alat</option>
              {tools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.item_name} - Tersedia:{" "}
                  {availableQuantities[tool.id] || 0}
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
              max={selectedTool ? availableQuantities[selectedTool.id] : 1}
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {selectedTool && (
              <p className="text-xs text-gray-500 mt-1">
                Tersedia: {availableQuantities[selectedTool.id] || 0}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Peminjaman
            </label>
            <input
              type="date"
              name="borrow_date"
              value={formData.borrow_date}
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
  const [tools, setTools] = useState<Tool[]>(mockTools);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  // Tambahan: listen to storage event for cross-tab update
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "refreshBorrowRecords") {
        fetchBorrowRecords();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const fetchBorrowRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const recordsRes = await api.get("/data3");
      const mappedRecords: BorrowRecord[] = recordsRes.data.data.map(
        (record: any) => ({
          id: record.log_tools,
          user_id: record.user_id || 0,
          user_name: record.user,
          tool_id: record.item_id || 0,
          tool_name: record.item_name,
          quantity: record.quantity,
          borrow_date: record.date_borrow,
          return_date: record.date_return,
          status: record.tools_status,
        })
      );
      setBorrowRecords(mappedRecords);
    } catch (err) {
      console.error("Kesalahan pengambilan data:", err);
      let errorMessage = "Gagal memuat data catatan peminjaman.";
      if (axios.isAxiosError(err)) {
        if (err.code === "ERR_NETWORK") {
          errorMessage =
            "Kesalahan Jaringan: Tidak dapat terhubung ke server API. Pastikan server backend berjalan di " +
            api.defaults.baseURL +
            " dan tidak ada masalah jaringan/CORS.";
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
    fetchBorrowRecords();
    // Cek jika ada flag refresh dari localStorage (misal setelah pinjam alat)
    if (window.localStorage.getItem("refreshBorrowRecords")) {
      window.localStorage.removeItem("refreshBorrowRecords");
      fetchBorrowRecords();
    }
  }, []);

  const handleBorrowTool = async (data: BorrowFormData) => {
    try {
      const toolToUpdate = tools.find((tool) => tool.id === data.tool_id);
      if (!toolToUpdate) {
        toast.error("Alat tidak ditemukan.");
        return;
      }

      if (toolToUpdate.quantity < data.quantity) {
        toast.error("Jumlah tidak cukup tersedia.");
        return;
      }

      const payload = {
        user: "Pengguna Saat Ini",
        item_name: toolToUpdate.item_name,
        quantity: data.quantity,
        date_borrow: data.borrow_date,
        date_return: null,
        tools_status: "borrowed",
      };
      console.log("Mengirimkan payload peminjaman:", payload);

      const response = await axios.get("http://192.168.110.100:8080/data2");
      console.log("Respons dari GET /data2:", response.data);
      toast.success("Data berhasil diambil dari /data2!");

      setShowBorrowModal(false);
      fetchBorrowRecords();
    } catch (err) {
      console.error("Kesalahan saat meminjam alat:", err);
      let errorMessage = "Gagal meminjam alat.";
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = `Kesalahan API: ${err.response.status} - ${
          err.response.data?.message || err.message
        }`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    }
  };

  const handleReturnTool = async (id: number) => {
    try {
      const recordToReturn = borrowRecords.find((record) => record.id === id);
      if (!recordToReturn) {
        toast.error("Catatan peminjaman tidak ditemukan.");
        return;
      }

      const payload = {
        log_tools: recordToReturn.id,
        user: recordToReturn.user_name,
        item_name: recordToReturn.tool_name,
        quantity: recordToReturn.quantity,
        date_borrow: recordToReturn.borrow_date,
        date_return: new Date().toISOString().split("T")[0],
        tools_status: "returned",
      };

      console.log("Payload pengembalian:", payload);
      const response = await api.put(`/data3/add/${id}`, payload);

      if (response.data && response.data.status === false) {
        toast.error(
          response.data.message || "Gagal mengembalikan alat (server error)."
        );
        return;
      }

      setBorrowRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.id === id
            ? {
                ...record,
                return_date: payload.date_return,
                status: "returned",
              }
            : record
        )
      );

      setTools((prevTools) =>
        prevTools.map((tool) =>
          tool.id === recordToReturn.tool_id
            ? { ...tool, quantity: tool.quantity + recordToReturn.quantity }
            : tool
        )
      );

      toast.success("Alat berhasil dikembalikan!");
      fetchBorrowRecords();
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
      record.user_name.toLowerCase().includes(search.toLowerCase()) ||
      record.tool_name.toLowerCase().includes(search.toLowerCase()) ||
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
            onClick={fetchBorrowRecords}
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
        <div className="p-8 bg-gray-50">
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
              <a
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
              </a>
              <a
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
              </a>
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
                          key={record.id}
                          record={record}
                          onReturn={
                            record.status === "borrowed"
                              ? handleReturnTool
                              : undefined
                          }
                        />
                      ))}
                      {/* Tambahkan baris kosong jika data sedikit agar tinggi tabel tetap konsisten */}
                      {currentItems.length < itemsPerPage &&
                        Array.from({
                          length: itemsPerPage - currentItems.length,
                        }).map((_, idx) => (
                          <tr key={`empty-${idx}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              &nbsp;
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap"></td>
                            <td className="px-6 py-4 whitespace-nowrap"></td>
                            <td className="px-6 py-4 whitespace-nowrap"></td>
                            <td className="px-6 py-4 whitespace-nowrap"></td>
                            <td className="px-6 py-4 whitespace-nowrap"></td>
                            <td className="px-6 py-4 whitespace-nowrap"></td>
                          </tr>
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

          {/* Modal Pinjam Alat di-nonaktifkan, gunakan halaman add */}
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
