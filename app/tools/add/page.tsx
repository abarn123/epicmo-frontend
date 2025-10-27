"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import AccessDenied from "../../components/AccessDenied";
import { toast } from "react-toastify";
import ProtectedRoute from "../../components/ProtectedRoute";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";
import axios from "axios";

export default function AddToolPage() {
  const router = useRouter();
  const { token, loading: authLoading, role } = useAuth();

  const [formData, setFormData] = useState({
    item_name: "",
    stock: "",
    item_condition: "",
    category: "",
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !token) {
      window.location.href = "/login";
    }
  }, [token, authLoading]);

  // Fetch kategori dari data2
  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return;
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/data2`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
    fetchCategories();
  }, [token]);

  if (!authLoading && role && role.toLowerCase() !== "admin") {
    return (
      <AccessDenied message="Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini." />
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!token) {
      toast.error("User is not authenticated");
      setSubmitting(false);
      return;
    }

    // --- ✅ VALIDASI WAJIB DIISI ---
    if (!formData.item_name.trim()) {
      setError("Nama alat tidak boleh kosong");
      setSubmitting(false);
      return;
    }

    if (!formData.stock || Number(formData.stock) < 0) {
      setError("Stok tidak valid");
      setSubmitting(false);
      return;
    }

    if (!formData.item_condition) {
      setError("Kondisi harus dipilih");
      setSubmitting(false);
      return;
    }

    if (!newCategory.trim() && !formData.category.trim()) {
      setError("Kategori harus dipilih atau diisi baru");
      setSubmitting(false);
      return;
    }

    const categoryToSend = newCategory.trim()
      ? newCategory.trim()
      : formData.category;

    const payload = {
      item_name: formData.item_name.trim(),
      stock: Number(formData.stock),
      item_condition: formData.item_condition,
      category: categoryToSend,
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/data2/add`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response:", response.data);
      toast.success("Tool berhasil ditambahkan");
      router.push("/tools");
    } catch (err: unknown) {
      console.error("Error saat menambahkan tool:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan tak dikenal");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Go back"
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
              <h1 className="text-2xl font-bold text-gray-800">
                Tambah Tool Baru
              </h1>
            </div>
          </div>

          {/* Form */}
          <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Form Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
                <h2 className="text-lg font-semibold text-gray-800">
                  Informasi Tool
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Silakan isi form berikut untuk menambahkan tool baru
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="divide-y divide-gray-200"
              >
                {error && (
                  <div className="px-6 py-4 bg-red-50">
                    <div className="flex items-center">
                      <svg
                        className="h-5 w-5 text-red-500 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-red-600 font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <div className="px-6 py-6 space-y-6">
                  {/* Nama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      name="item_name"
                      value={formData.item_name}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: Kamera"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-800"
                    />
                  </div>

                  {/* Stok */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stok<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      min={0}
                      placeholder="Jumlah stok"
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-800"
                    />
                  </div>

                  {/* Kondisi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kondisi<span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      name="item_condition"
                      value={formData.item_condition}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-800"
                    >
                      <option value="" disabled>
                        Pilih kondisi
                      </option>
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
                        value={formData.category}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-800"
                      >
                        <option value="">
                          Pilih kategori (atau masukkan baru di bawah)
                        </option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="new_category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Masukkan kategori baru (opsional)"
                        className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 text-right">
                  <div className="flex justify-end space-x-3">
                    <Link
                      href="/tools"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Batal
                    </Link>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
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
                        "Tambah Tool"
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
