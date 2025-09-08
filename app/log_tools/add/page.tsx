"use client";
import React, { useState, useEffect } from "react";
import ProtectedRoute from "../../components/ProtectedRoute";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

type Tool = {
  id: string;
  item_name: string;
  stock: number;
  item_condition: string;
  category: string;
};

type BorrowFormData = {
  user_id: number | null;
  tool_id: string;
  quantity: number;
  borrow_date: string;
  return_date: string | null;
};

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export default function AddBorrowPage() {
  const router = useRouter();
  const { token, loading: authLoading, userName, userId } = useAuth();

  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<BorrowFormData>({
    user_id: null,
    tool_id: "",
    quantity: 0,
    borrow_date: new Date().toISOString().split("T")[0],
    return_date: null,
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
              id: tool.id?.toString() || `generated-${index}-${Date.now()}`,
              item_name: tool.item_name || "No name",
              stock: tool.stock || 0,
              item_condition: tool.item_condition || "",
              category: tool.category || "Lainnya",
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

  // Debounce untuk mencegah multiple calls
  const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "quantity") {
        // Parse nilai input
        let quantity = parseInt(value, 10);
        
        // Jika bukan angka, set ke 0
        if (isNaN(quantity)) {
          return { ...prev, quantity: 0 };
        }
        
        const selectedTool = tools.find((t) => t.id === prev.tool_id);
        const maxQuantity = selectedTool?.stock || 0;

        // Pastikan quantity minimal 0 dan maksimal sesuai stok
        quantity = Math.max(0, Math.min(quantity, maxQuantity));
        return { ...prev, quantity };
      }

      if (name === "tool_id") {
        return { ...prev, tool_id: value, quantity: 0 };
      }

      return { ...prev, [name]: value };
    });
  };

  // Debounced version of handleChange untuk input number
  const debouncedHandleChange = debounce(handleChange, 300);

  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Untuk input number, gunakan handler langsung tanpa debounce
    if (name === "quantity") {
      let quantity = parseInt(value, 10);
      
      if (isNaN(quantity)) {
        quantity = 0;
      }
      
      const selectedTool = tools.find((t) => t.id === formData.tool_id);
      const maxQuantity = selectedTool?.stock || 0;
      
      quantity = Math.max(0, Math.min(quantity, maxQuantity));
      
      setFormData(prev => ({ ...prev, quantity }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "tool_id") {
      setFormData(prev => ({ ...prev, tool_id: value, quantity: 0 }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

      const selectedTool = tools.find((t) => t.id === formData.tool_id);
      if (!selectedTool) throw new Error("Alat tidak ditemukan");
      
      if (formData.quantity < 1) {
        throw new Error("Jumlah peminjaman minimal 1");
      }
      
      if (selectedTool.stock < formData.quantity) {
        throw new Error("Jumlah tidak cukup tersedia");
      }

      // Pastikan payload sesuai dengan yang diharapkan backend
      const payload = {
        user_id: formData.user_id,
        tools_id: selectedTool.id,
        tools_status: "borrowed",
        quantity: formData.quantity,
        date_borrow: formData.borrow_date,
        date_return: null,
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit borrow request");
      }

      const result = await response.json();
      console.log("Response dari server:", result);
      
      if (result.status === false) {
        throw new Error(result.message || "Server rejected the request");
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

  const selectedTool = tools.find((t) => t.id === formData.tool_id);

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

          <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-lg leading-6 font-medium text-black">
                  Formulir Peminjaman
                </h3>
                <p className="mt-1 text-sm text-black">
                  Isi semua field yang diperlukan untuk meminjam alat
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
                  <div className="col-span-6 sm:col-span-4">
                    <label
                      htmlFor="tool_id"
                      className="block text-sm font-medium text-black"
                    >
                      Alat <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tool_id"
                      name="tool_id"
                      value={formData.tool_id}
                      onChange={handleSelectChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      required
                      style={{ color: "#000" }}
                      disabled={loadingTools || tools.length === 0}
                    >
                      <option value="" className="text-black">
                        {loadingTools 
                          ? "Memuat data alat..." 
                          : tools.length === 0 
                            ? "Tidak ada alat tersedia" 
                            : "Pilih Alat"}
                      </option>
                      {tools.map((tool) => (
                        <option
                          key={tool.id}
                          value={tool.id}
                          className="text-black"
                          disabled={tool.stock === 0}
                        >
                          {tool.item_name} {tool.stock === 0 ? "(Habis)" : `(Tersedia: ${tool.stock})`}
                        </option>
                      ))}
                    </select>
                    {tools.length === 0 && !loadingTools && (
                      <p className="mt-1 text-sm text-red-600">
                        Tidak ada alat yang tersedia untuk dipinjam.
                      </p>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-black"
                    >
                      Jumlah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="0"
                      max={selectedTool?.stock || 0}
                      value={formData.quantity}
                      onChange={handleNumberInput}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      required
                      style={{ color: "#000" }}
                      disabled={!formData.tool_id || selectedTool?.stock === 0}
                    />
                    <p className="mt-1 text-xs text-black">
                      Tersedia: {selectedTool?.stock ?? 0} alat
                    </p>
                    {formData.quantity === 0 && formData.tool_id && (
                      <p className="mt-1 text-xs text-red-600">
                        Jumlah peminjaman harus lebih dari 0
                      </p>
                    )}
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="borrow_date"
                      className="block text-sm font-medium text-black"
                    >
                      Tanggal Peminjaman <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="borrow_date"
                      name="borrow_date"
                      value={formData.borrow_date}
                      onChange={handleDateChange}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                      required
                      style={{ color: "#000" }}
                    />
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
                    disabled={submitting || !formData.user_id || formData.quantity === 0 || !formData.tool_id || selectedTool?.stock === 0}
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 极 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
                          viewBox="极 0 24 24"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c极 3.042 1.135 5.824 3 7.938l3-2.647z"
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