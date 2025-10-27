"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import AccessDenied from "../../components/AccessDenied";
import Link from "next/link";
import ProtectedRoute from "../../components/ProtectedRoute";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";

type Tool = {
  id: string;
  name: string;
  quantity: number;
  status: string;
  category: string;
};

export default function EditToolPage() {
  const params = useSearchParams();
  const toolId = params.get("id");
  const { token, role } = useAuth();

  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kategori
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");

  /** Fetch Data Alat berdasarkan ID **/
  const fetchToolData = async () => {
    if (!toolId) {
      setError("ID alat tidak ditemukan");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/data2/${toolId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );
      const data = res.data?.data || res.data;
      setTool({
        id: data.id,
        name: data.item_name || data.name || "",
        quantity: data.stock ?? data.quantity ?? 0,
        status: data.item_condition ?? data.status ?? "",
        category: data.category ?? "",
      });
    } catch (err: any) {
      console.error("Error fetching tool data:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          toast.error("Sesi kedaluwarsa. Silakan login kembali.");
          setError("User is not authenticated");
        } else if (err.response?.status === 404) {
          toast.error("Alat tidak ditemukan");
          setError("Alat tidak ditemukan");
        } else if (err.response?.status === 500) {
          toast.error("Server error. Silakan coba lagi.");
          setError("Server error. Silakan coba lagi.");
        } else if (err.code === "ECONNABORTED") {
          toast.error("Request timeout. Silakan coba lagi.");
          setError("Request timeout. Silakan coba lagi.");
        } else {
          toast.error("Gagal mengambil data alat");
          setError("Gagal mengambil data alat");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  /** Fetch semua kategori yang tersedia **/
  const fetchCategories = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/data2`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = res.data;
      if (data && data.data) data = data.data;
      if (!Array.isArray(data)) return;
      const cats = Array.from(
        new Set(data.map((t: any) => t.category || "Lainnya"))
      );
      setCategories(cats.filter(Boolean));
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchToolData();
    fetchCategories();
  }, [toolId, token]);

  /** Handle perubahan input **/
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setTool((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;
    setTool((prev) => (prev ? { ...prev, [name]: numValue } : null));
  };

  /** Submit update **/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tool) return;

    const categoryToSend = newCategory.trim() || tool.category || "Lainnya";

    setSubmitting(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/data2/edit/${tool.id}`,
        {
          id: tool.id,
          item_name: tool.name,
          stock: tool.quantity,
          item_condition: tool.status,
          category: categoryToSend,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Alat berhasil diperbarui");
      window.location.href = "/tools";
    } catch (err) {
      console.error("Error updating tool:", err);
      toast.error("Gagal memperbarui alat");
    } finally {
      setSubmitting(false);
    }
  };

  /** Kondisi Akses **/
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <div className="text-gray-600">Memuat data alat...</div>
        </div>
      </div>
    );
  }

  if (role && role.toLowerCase() !== "admin") {
    return (
      <AccessDenied message="Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini." />
    );
  }

  if (error) {
    if (error === "User is not authenticated") {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
            <p className="text-gray-600 mb-6">
              Anda harus login terlebih dahulu untuk mengakses halaman ini.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md w-full"
            >
              Login
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchToolData}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md w-full"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!tool) return null;

  /** UI utama **/
  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Edit Alat</h1>
            </div>
          </div>

          {/* Form */}
          <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                <h2 className="text-lg font-semibold text-gray-800">
                  Informasi Alat
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Perbarui informasi alat di bawah ini
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="divide-y divide-gray-200"
              >
                <div className="px-6 py-6 space-y-6">
                  {/* Nama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Alat<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={tool.name}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-800"
                    />
                  </div>

                  {/* Jumlah */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      min="0"
                      value={tool.quantity}
                      onChange={handleNumberChange}
                      required
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-800"
                    />
                  </div>

                  {/* Kondisi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kondisi<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="status"
                      value={tool.status}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-800"
                    >
                      <option value="new">Baru</option>
                      <option value="second">Bekas</option>
                    </select>
                  </div>

                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="space-y-2">
                      <select
                        name="category"
                        value={tool.category}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-800"
                      >
                        <option value="">
                          Pilih kategori (atau isi baru di bawah)
                        </option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        id="new_category"
                        name="new_category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-800"
                        placeholder="Masukkan kategori baru (opsional)"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 text-right">
                  <div className="flex justify-end space-x-3">
                    <Link
                      href="/tools"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Batal
                    </Link>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan Perubahan"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
