"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "../../components/ProtectedRoute";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";

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

// Axios instance dengan interceptor untuk menambahkan token
const createApiInstance = () => {
  const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://192.168.110.193:8080",
    timeout: 0,
  });

  instance.interceptors.request.use((config) => {
    // Mengambil token dari localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.error("Token tidak ditemukan di localStorage");
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        toast.error("Sesi kedaluwarsa. Silakan login kembali.");
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export default function EditBorrowRecord() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const logToolsIds = searchParams?.get("id")?.split(",") || [];

  // Create API instance with interceptors
  const api = createApiInstance();

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
              user_id: record.user_id?.toString() || "unknown-user",
              user: record.user || "Unknown User",
              tools_id: record.tools_id?.toString() || "unknown-tool",
              item_name: record.item_name || "Unknown Tool",
              quantity: record.quantity || 0,
              date_borrow: record.date_borrow || new Date().toISOString(),
              date_return: record.date_return || null,
              tools_status:
                record.tools_status === "return" ? "return" : "borrowed",
            }))
          : [];

        setBorrowRecords(mappedRecords);
        
        // Filter records based on the IDs from URL
        const filteredRecords = mappedRecords.filter(record => 
          logToolsIds.includes(record.log_tools)
        );
        
        setSelectedRecords(filteredRecords);
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
  }, [logToolsIds.join(",")]); // Menggunakan join untuk menghindari perubahan array yang tidak perlu

 const handleReturn = async () => {
  try {
    setSubmitting(true);
    setError(null);

    console.log("Selected records:", selectedRecords);

    // Update each selected record - hanya mengirim data yang diperlukan
    const updatePromises = selectedRecords.map(record => {
      // Payload kosong atau hanya status jika diperlukan
      // Sesuaikan dengan kebutuhan API backend Anda
      const payload = {
        // Jika backend hanya perlu tahu bahwa status berubah ke "return"
        tools_status: "return",
        date_return: new Date().toISOString() // Tambahkan timestamp pengembalian
      };
      
      console.log(`Updating record ${record.log_tools} with:`, payload);
      
      // Gunakan endpoint /data3/{id} dengan method PUT
      return api.put(`/data3/${record.log_tools}`, payload);
    });

    const results = await Promise.all(updatePromises);
    console.log("Update results:", results);
    
    // Periksa response dari backend
    const allSuccess = results.every(result => 
      result.data && result.data.status === true
    );
    
    if (allSuccess) {
      toast.success("Alat berhasil dikembalikan dan stok diperbarui");
      
      // Redirect setelah berhasil
      setTimeout(() => {
        router.push("/log_tools");
      }, 1500);
    } else {
      const errorMessages = results
        .filter(result => !result.data || result.data.status === false)
        .map(result => result.data?.message || "Unknown error")
        .join(", ");
      
      throw new Error(`Beberapa pengembalian gagal: ${errorMessages}`);
    }
    
  } catch (err) {
    console.error("Kesalahan mengembalikan alat:", err);
    let errorMessage = "Gagal mengembalikan alat.";
    
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // Handle response error dari backend
        const backendMessage = err.response.data?.message;
        errorMessage = `Kesalahan: ${backendMessage || err.message}`;
        
        // Tampilkan detail error di console untuk debugging
        console.error("Detail error backend:", err.response.data);
      } else if (err.code === "ERR_NETWORK") {
        errorMessage = "Kesalahan jaringan: Tidak dapat terhubung ke server";
      } else {
        errorMessage = err.message;
      }
    } else if (err instanceof Error) {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    toast.error(errorMessage);
  } finally {
    setSubmitting(false);
  }
};

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
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Coba Lagi
            </button>
            <Link
              href="/log_tools"
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  Pengembalian Alat
                </h1>
                <p className="text-gray-500">
                  Konfirmasi pengembalian alat yang dipinjam
                </p>
              </div>
              <div className="mb-4 md:mb-0 md:ml-4 flex justify-end">
                <Link
                  href="/log_tools"
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
                  Kembali
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Detail Peminjaman
              </h2>
              
              {selectedRecords.length > 0 && (
                <div className="mb-4">
                  <p className="text-gray-600">
                    <span className="font-medium">Peminjam:</span> {selectedRecords[0].user}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Tanggal Pinjam:</span>{" "}
                    {new Date(selectedRecords[0].date_borrow).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Alat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedRecords.map((record) => (
                      <tr key={record.log_tools}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.item_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {record.quantity}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Konfirmasi Pengembalian
              </h2>
              <p className="text-gray-600 mb-6">
                Dengan menekan tombol di bawah, Anda mengonfirmasi bahwa semua alat yang tercatat telah dikembalikan dalam kondisi baik. Stok alat akan otomatis diperbarui.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Link
                  href="/log_tools"
                  className="px-5 py-2.5 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400"
                >
                  Batal
                </Link>
                <button
                  onClick={handleReturn}
                  disabled={submitting}
                  className={`px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center ${
                    submitting ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Memproses...
                    </>
                  ) : (
                    "Konfirmasi Pengembalian"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}