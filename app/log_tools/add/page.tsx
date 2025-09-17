"use client";
import React, { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

type Tool = {
  id: number;
  item_name: string;
  stock: number;
  item_condition: string;
  category: string;
  selected: boolean;
  quantity: number;
};

type BorrowFormData = {
  user_id: number | null;
  date_borrow: string;
  date_return: string | null;
  tools_status: string;
  due_date: string; // Tambahan: tanggal batas peminjaman
  reason: string;   // Tambahan: alasan meminjam
};

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function AddBorrowPage() {
  const router = useRouter();
  const { token, loading: authLoading, userName, userId } = useAuth();

  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showCategoryTools, setShowCategoryTools] = useState<boolean>(false);

  // Hitung tanggal 7 hari dari sekarang untuk due_date default
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 7);

  const [formData, setFormData] = useState<BorrowFormData>({
    user_id: null,
    date_borrow: new Date().toISOString().split("T")[0],
    date_return: null,
    tools_status: "borrowed", // Status default untuk peminjaman
    due_date: defaultDueDate.toISOString().split("T")[0], // Default 7 hari dari sekarang
    reason: "" // Alasan peminjaman default kosong
  });

  useEffect(() => {
    if (userId) {
      setFormData((prev) => ({ ...prev, user_id: userId }));
    }
  }, [userId]);

  // Fetch tools from /data2
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const response = await axios.get(`${API_BASE_URL}/data2`, config);
        let toolsData = response.data;

        console.log("API /data2 response:", toolsData);

        // Cek beberapa kemungkinan struktur respons
        if (
          toolsData &&
          typeof toolsData === "object" &&
          Array.isArray(toolsData.data)
        ) {
          toolsData = toolsData.data;
        } else if (
          toolsData &&
          typeof toolsData === "object" &&
          Array.isArray(toolsData.tools)
        ) {
          toolsData = toolsData.tools;
        } else if (!Array.isArray(toolsData)) {
          toolsData = Object.values(toolsData)
            .filter((v) => Array.isArray(v))
            .flat();
        }

        if (Array.isArray(toolsData)) {
          // Filter hanya alat dengan stok lebih dari 0
          const availableTools = toolsData.filter((tool: any) => (tool.stock || 0) > 0);
          
          const processedTools: Tool[] = availableTools.map(
            (tool: any, index: number) => ({
              id: tool.id ? parseInt(tool.id) : index + 0,
              item_name: tool.item_name || "No name",
              stock: tool.stock || 0,
              item_condition: tool.item_condition || "",
              category: tool.category || "Lainnya",
              selected: false,
              quantity: 0
            })
          );
          setTools(processedTools);
        } else {
          setTools([]);
        }
      } catch (err) {
        setTools([]);
        console.error("Gagal fetch data2:", err);
        toast.error("Gagal mengambil data alat");
      } finally {
        setLoadingTools(false);
      }
    };
    fetchTools();
  }, [token]);

  const handleError = (error: unknown, defaultMessage: string) => {
    const message = error instanceof Error ? error.message : defaultMessage;
    setError(message);
    toast.error(message);
    console.error(error);
  };

  const handleToolSelection = (id: number, selected: boolean) => {
    setTools(prevTools => 
      prevTools.map(tool => 
        tool.id === id 
          ? { ...tool, selected, quantity: selected ? 1 : 0 } 
          : tool
      )
    );
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    setTools(prevTools => 
      prevTools.map(tool => {
        if (tool.id === id) {
          // Validasi jumlah tidak melebihi stok dan minimal 1
          const validQuantity = Math.max(1, Math.min(quantity, tool.stock));
          return { ...tool, quantity: validQuantity };
        }
        return tool;
      })
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setShowCategoryTools(category !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!token) throw new Error("Not authenticated");
      if (!formData.user_id) {
        toast.error("User ID belum tersedia. Silakan tunggu sebentar...");
        setSubmitting(false);
        return;
      }

      // Validasi tanggal
      const borrowDate = new Date(formData.date_borrow);
      const dueDate = new Date(formData.due_date);
      
      if (dueDate <= borrowDate) {
        throw new Error("Tanggal batas peminjaman harus setelah tanggal peminjaman");
      }

      // Validasi alasan
      if (!formData.reason.trim()) {
        throw new Error("Alasan peminjaman harus diisi");
      }

      // Dapatkan alat yang dipilih
      const selectedTools = tools.filter(tool => tool.selected);
      
      // Validasi
      if (selectedTools.length === 0) {
        throw new Error("Silakan pilih minimal satu alat");
      }

      for (const tool of selectedTools) {
        if (tool.quantity < 1) {
          throw new Error(`Jumlah peminjaman minimal 1 untuk ${tool.item_name}`);
        }
        
        if (tool.stock < tool.quantity) {
          throw new Error(`Jumlah tidak cukup tersedia untuk ${tool.item_name}`);
        }
      }

      // Siapkan payload yang sesuai dengan backend
      const payload = {
        user_id: formData.user_id,
        tools_status: "borrowed", // Status untuk peminjaman
        tools: selectedTools.map(tool => ({
          tools_id: tool.id,
          quantity: tool.quantity
        })),
        date_borrow: formData.date_borrow,
        date_return: null,
        due_date: formData.due_date, // Tambahkan due_date ke payload
        reason: formData.reason      // Tambahkan reason ke payload
      };

      console.log("Payload yang dikirim:", payload);

      const response = await fetch(`${API_BASE_URL}/data3/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("Response dari server:", responseData);
      
      if (!response.ok || !responseData.status) {
        throw new Error(responseData.message || "Failed to submit borrow request");
      }

      toast.success("Berhasil meminjam alat!");
      localStorage.setItem("refreshBorrowRecords", Date.now().toString());
      router.push("/log_tools");
    } catch (err) {
      handleError(err, "Gagal meminjam alat");
    } finally {
      setSubmitting(false);
    }
  };

  // Dapatkan daftar kategori unik
  const categories = Array.from(new Set(tools.map(tool => tool.category)));

  // Filter alat berdasarkan kategori yang dipilih
  const filteredTools = selectedCategory 
    ? tools.filter(tool => tool.category === selectedCategory)
    : [];

  if (loadingTools) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-600">Memuat data alat...</div>
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
            onClick={() => router.push("/log_tools")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold leading-7 text-black sm:text-3xl sm:truncate">
                    Peminjaman Alat
                  </h1>
                  <p className="mt-2 text-sm text-black">
                    Formulir untuk meminjam alat yang tersedia
                  </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <button
                    type="button"
                    onClick={() => router.push("/log_tools")}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Kembali
                  </button>
                </div>
              </div>
            </div>
          </div>

          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-lg leading-6 font-medium text-black">
                  Formulir Peminjaman
                </h3>
                <p className="mt-1 text-sm text-black">
                  Pilih kategori terlebih dahulu, kemudian pilih alat yang ingin dipinjam
                </p>
              </div>

              <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-4">
                    <label className="block text-sm font-medium text-black">
                      Nama Peminjam
                    </label>
                    <input
                      type="text"
                      value={
                        authLoading
                          ? "Memuat nama user..."
                          : token
                          ? userName || "User"
                          : "User"
                      }
                      readOnly
                      disabled={authLoading || !token || !userName}
                      placeholder={
                        authLoading
                          ? "Memuat nama user..."
                          : !token
                          ? "User"
                          : "Nama user tidak ditemukan"
                      }
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm focus:outline-none sm:text-sm text-black"
                      style={{ color: "#000" }}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-black">
                      Pilih Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={handleCategoryChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      style={{ color: "#000" }}
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {categories.map((category) => (
                        <option key={category} value={category} className="text-black">
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showCategoryTools && (
                    <div className="col-span-6">
                      <h4 className="text-lg font-medium text-black mb-4">
                        Alat dalam Kategori: {selectedCategory}
                      </h4>
                      
                      {filteredTools.length === 0 ? (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                          <div className="flex">
                            <div className="ml-3">
                              <p className="text-sm text-yellow-700">
                                Tidak ada alat yang tersedia dalam kategori ini.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="divide-y divide-gray-200">
                            {filteredTools.map((tool) => (
                              <div key={tool.id} className="px-4 py-3 flex items-center justify-between">
                                <div className="flex items-center space-x-3 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={tool.selected}
                                    onChange={(e) => handleToolSelection(tool.id, e.target.checked)}
                                    disabled={tool.stock === 0}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <label className="text-sm font-medium text-black cursor-pointer">
                                      {tool.item_name}
                                    </label>
                                    <p className="text-xs text-gray-500">
                                      Kondisi: {tool.item_condition} | Stok: {tool.stock}
                                    </p>
                                  </div>
                                </div>
                                {tool.selected && (
                                  <div className="ml-4 flex items-center">
                                    <label htmlFor={`quantity-${tool.id}`} className="sr-only">
                                      Jumlah
                                    </label>
                                    <input
                                      type="number"
                                      id={`quantity-${tool.id}`}
                                      min="1"
                                      max={tool.stock}
                                      value={tool.quantity}
                                      onChange={(e) => handleQuantityChange(tool.id, parseInt(e.target.value) || 1)}
                                      className="w-20 py-1 px-2 border border-gray-300 rounded-md shadow-sm text-sm text-black"
                                      style={{ color: "#000" }}
                                    />
                                    <span className="ml-2 text-sm text-black">pcs</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="col-span-6">
                    <h4 className="text-lg font-medium text-black mb-4">
                      Alat yang Dipilih
                    </h4>
                    
                    {tools.filter(tool => tool.selected).length === 0 ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-500">Belum ada alat yang dipilih</p>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2">
                          <h5 className="text-sm font-medium text-gray-700">Daftar Alat Dipilih</h5>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {tools.filter(tool => tool.selected).map((tool) => (
                            <div key={tool.id} className="px-4 py-3 flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-black">{tool.item_name}</p>
                                <p className="text-xs text-gray-500">Kategori: {tool.category}</p>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm text-black mr-3">{tool.quantity} pcs</span>
                                <button
                                  type="button"
                                  onClick={() => handleToolSelection(tool.id, false)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="date_borrow"
                      className="block text-sm font-medium text-black"
                    >
                      Tanggal Peminjaman <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date_borrow"
                      name="date_borrow"
                      value={formData.date_borrow}
                      onChange={handleInputChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      required
                      style={{ color: "#000" }}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="due_date"
                      className="block text-sm font-medium text-black"
                    >
                      Tanggal Batas Peminjaman <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="due_date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleInputChange}
                      min={formData.date_borrow}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      required
                      style={{ color: "#000" }}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Tanggal terakhir untuk mengembalikan alat
                    </p>
                  </div>

                  <div className="col-span-6">
                    <label
                      htmlFor="reason"
                      className="block text-sm font-medium text-black"
                    >
                      Alasan Peminjaman <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      placeholder="Jelaskan alasan dan tujuan peminjaman alat"
                      required
                      style={{ color: "#000" }}
                    ></textarea>
                  </div>
                </div>

                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 mt-6">
                  <button
                    type="button"
                    onClick={() => router.push("/log_tools")}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.user_id || 
                      tools.filter(t => t.selected).length === 0}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75"
                  >
                    {!formData.user_id ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-极V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c极 3.042 1.135 5.824 3 7.938极3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-black">Memuat User...</span>
                      </>
                    ) : submitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity极25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-black">Memproses...</span>
                      </>
                    ) : (
                      <span className="text-white">Pinjam Alat</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}