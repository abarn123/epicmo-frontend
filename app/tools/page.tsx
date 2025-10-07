"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

// Type definitions
type Tool = {
  id: string;
  item_name: string;
  stock: number;
  item_condition: string;
  category: string;
};

type ToolFormData = Omit<Tool, "id">;

// ToolCard component
import { useRouter as useNextRouter } from "next/navigation";

function ToolCard({
  tool,
  onDelete,
  role,
}: {
  tool: Tool;
  onDelete?: (toolId: string) => void;
  role?: string;
}) {
  const router = useNextRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(tool.id);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg border border-gray-100">
      <div className="p-5">
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full h-12 w-12 flex items-center justify-center text-white font-bold text-lg">
            {tool.item_name[0]}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {tool.item_name}
            </h2>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
              {tool.category}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start">
            <svg
              className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span>Stock: {tool.stock}</span>
          </div>
          <div className="flex items-start">
            <svg
              className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Kondisi: {tool.item_condition}</span>
          </div>
        </div>
      </div>
      {/* Tombol edit & hapus hanya jika bukan freelance */}
      {role !== "freelance" && (
        <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2 border-t border-gray-100">
          <Link
            href={`/tools/edit?id=${tool.id}`}
            className="px-3 py-1.5 text-sm font-medium rounded-md text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 transition-colors flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 极H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Link>
          {onDelete && (
            <>
              {showDeleteConfirm ? (
                <div className="flex space-x-2">
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-1.5 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center"
                  >
                    {isDeleting ? (
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
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Konfirmasi
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="px-3 py-1.5 text-sm font-medium rounded-md text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 transition-colors flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Hapus
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Main ToolsPage component

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("role")?.toLowerCase() || null);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    const fetchTools = async () => {
      try {
        if (!token) {
          setError("User is not authenticated");
          setLoading(false);
          return;
        }
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/data2`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let toolsData = response.data;
        if (toolsData && typeof toolsData === "object" && !Array.isArray(toolsData)) {
          if (Array.isArray(toolsData.data)) {
            toolsData = toolsData.data;
          }
        }
        if (!Array.isArray(toolsData)) {
          throw new Error("API did not return an array of tools");
        }
        const processedTools = toolsData.map((t: any, index: number) => ({
          id: t.id?.toString() || `generated-${index}-${Date.now()}`,
          item_name: t.item_name || "No name",
          stock: t.stock || 0,
          item_condition: t.item_condition ?? t.condition ?? "",
          category: t.category || "Lainnya",
        }));
        setTools(processedTools);
      } catch (err) {
        console.error("Fetch error:", err);
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          setError("User is not authenticated");
        } else {
          setError(err instanceof Error ? err.message : "Unknown error occurred");
        }
        toast.error("Gagal memuat data alat");
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, [token, authLoading]);

  // FILTERING/SEARCH
  const filteredTools = tools.filter((tool) => {
    const q = search.toLowerCase();
    return (
      tool.item_name.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.item_condition.toLowerCase().includes(q)
    );
  });

  // Pagination logic
  const indexOfLastTool = currentPage * itemsPerPage;
  const indexOfFirstTool = indexOfLastTool - itemsPerPage;
  const currentTools = filteredTools.slice(indexOfFirstTool, indexOfLastTool);
  const totalPages = Math.ceil(filteredTools.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSaveNewTool = async (newTool: ToolFormData) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/data2/add`,
        newTool,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const createdTool = {
        ...newTool,
        id: response.data.id || `generated-${Date.now()}`,
      };
      setTools([...tools, createdTool]);
      setShowAddModal(false);
      setCurrentPage(1);
      toast.success("Alat berhasil ditambahkan");
    } catch (err) {
      console.error("Error adding tool:", err);
      toast.error("Gagal menambahkan alat");
    }
  };

  const handleSaveEditedTool = async (editedTool: Tool) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/data2/${editedTool.id}`,
        editedTool,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTools(tools.map((t) => (t.id === editedTool.id ? editedTool : t)));
      setEditingTool(null);
      toast.success("Perubahan berhasil disimpan");
    } catch (err) {
      console.error("Error updating tool:", err);
      toast.error("Gagal menyimpan perubahan");
    }
  };

  const handleDeleteTool = async (toolsId: string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/data2/delete/${toolsId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const updatedTools = tools.filter((u) => u.id !== toolsId);
      setTools(updatedTools);
      if (
        updatedTools.length > 0 &&
        currentPage > Math.ceil(updatedTools.length / itemsPerPage)
      ) {
        setCurrentPage(Math.ceil(updatedTools.length / itemsPerPage));
      }
      toast.success("Alat berhasil dihapus");
    } catch (err) {
      console.error("Error deleting tool:", err);
      toast.error("Gagal menghapus alat");
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <div className="text-gray-600">Memuat data alat...</div>
        </div>
      </div>
    );
  }

  if (error && !authLoading) {
    // If error is authentication related, show access denied message
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
            <div className="space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md w-full flex items-center justify-center"
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
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    // For other errors, show generic error message
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg极-w-md w-full text-center">
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
          <h3 className="text-xl font-semib极 text-gray-900 mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md w-full"
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
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 relative p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Manajemen Alat
              </h1>
              <p className="text-gray-500">
                Kelola data alat dengan mudah dan efisien
              </p>
            </div>
            <div className="mb-4 md:mb-0 md:ml-4 flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-4">
              {/* SEARCH BAR */}
              <div className="relative max-w-xs w-full md:w-64">
                <input
                  type="text"
                  placeholder="Cari alat, kategori, kondisi..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              {/* Tombol tambah alat hanya jika bukan freelance */}
              {role !== "freelance" && (
                <Link
                  href="/tools/add"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md flex items-center"
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
                  Tambah Alat
                </Link>
              )}
              <Link
                href="/log_tools"
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition shadow-md flex items-center"
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2极5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Peminjaman
              </Link>
            </div>
          </div>

          <div className="flex-1">
            {filteredTools.length === 0 ? (
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
                  Tidak ada alat ditemukan
                </h3>
                <p className="text-gray-500 mb-4">
                  Coba kata kunci lain atau tambahkan alat baru
                </p>
                <Link
                  href="/tools/add"
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md inline-block"
                >
                  Tambah Alat Pertama
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentTools.map((tool) => (
                    <ToolCard
                      key={`tool-${tool.id}`}
                      tool={tool}
                      onDelete={handleDeleteTool}
                      role={role || ""}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sticky Pagination Footer - Fixed position */}
          {totalPages > 1 && (
            <div className="mt-auto pt-6">
              <div className="w-full flex justify-center">
                <nav
                  className="inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-l-md border ${
                      currentPage === 1
                        ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
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
                      paginate(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-r-md border ${
                      currentPage === totalPages
                        ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          )}
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}