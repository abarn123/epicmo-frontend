// ...existing code...
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { logTokenUsage } from "../../debug_frontend_token";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

type User = {
  id: string;
  name: string;
  phone: string;
  address: string;
  role: string;
};

type UserFormData = Omit<User, "id">;

function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(user.id);
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
            {user.name[0]}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{user.name}</h2>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                user.role === "admin"
                  ? "bg-purple-100 text-purple-800"
                  : user.role === "manager"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {user.role}
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            <span>{user.phone}</span>
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>{user.address}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 px-5 py-3 flex justify-end space-x-2 border-t border-gray-100">
        {onEdit && (
          <Link
            href={`/user/edit?id=${user.id}`}
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Link>
        )}

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
    </div>
  );
}

function EditUserModal({
  user,
  onSave,
  onCancel,
}: {
  user: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<User>({ ...user, role: user.role.toLowerCase() });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white">
          <h2 className="text-xl font-semibold">Edit Pengguna</h2>
          <p className="text-blue-100 text-sm">Perbarui informasi pengguna</p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>



          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Telepon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white"
                required
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-md"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddUserModal({
  onSave,
  onCancel,
}: {
  onSave: (user: UserFormData) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    phone: "",
    address: "",
    role: "user",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white">
          <h2 className="text-xl font-semibold">Tambah Pengguna Baru</h2>
          <p className="text-blue-100 text-sm">
            Isi form untuk menambahkan pengguna baru
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>



          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No. Telepon
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition appearance-none bg-white"
                required
              >
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition shadow-md"
            >
              Tambah Pengguna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(6);
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    
      if (!token) {
        setError("User is not authenticated");
        setLoading(false);
        return;
      }
    
    logTokenUsage();
    const fetchUsers = async () => {
      console.log("Token used for fetchUsers:", token);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/data1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("API Response:", response.data);

        let usersData = response.data;
        if (
          usersData &&
          typeof usersData === "object" &&
          !Array.isArray(usersData)
        ) {
          if (Array.isArray(usersData.data)) {
            usersData = usersData.data;
          } else if (Array.isArray(usersData.users)) {
            usersData = usersData.users;
          }
        }

        if (!Array.isArray(usersData)) {
          throw new Error("API did not return an array of users");
        }

        const processedUsers = usersData.map((u: any, index: number) => {
          const id = u.id?.toString() || `generated-${index}-${Date.now()}`;
          return {
            id,
            name: u.name || "No name",
            phone: u.phone || "No phone",
            address: u.address || "No address",
            role: u.role || "user",
          };
        });

        const idSet = new Set();
        const duplicates = processedUsers.filter((user) => {
          if (idSet.has(user.id)) {
            console.warn(`Duplicate user ID detected: ${user.id}`);
            return true;
          }
          idSet.add(user.id);
          return false;
        });

        if (duplicates.length > 0) {
          console.error("Duplicate users found:", duplicates);
          throw new Error("Duplicate user IDs detected in API response");
        }

        setUsers(processedUsers);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        toast.error("Gagal memuat data pengguna");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, authLoading]);

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleSaveNewUser = async (newUser: UserFormData) => {
    if (!token) {
      toast.error("User is not authenticated");
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/data1`,
        newUser,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const createdUser = {
        ...newUser,
        id: response.data.id || `generated-${Date.now()}`,
      };
      setUsers([...users, createdUser]);
      setShowAddModal(false);
      setCurrentPage(Math.ceil((users.length + 1) / usersPerPage));
      toast.success("Pengguna berhasil ditambahkan");
    } catch (err) {
      console.error("Error adding user:", err);
      toast.error("Gagal menambahkan pengguna");
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleSaveEditedUser = async (updatedUser: User) => {
    if (!token) {
      toast.error("User is not authenticated");
      return;
    }
    try {
      // Kirim hanya field yang diperlukan, dan pastikan role lowercase
      const { id, name, phone, address, role } = updatedUser;
      const payload = {
        id,
        name,
        phone,
        address,
        role: role,
      };
      console.log("Payload for update:", payload);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/data1/edit/${id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status || response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === id ? { ...updatedUser, role: role.toLowerCase() } : user
          )
        );
        setEditingUser(null);
        toast.success("Perubahan berhasil disimpan");
      } else {
        toast.error("Gagal menyimpan perubahan");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      // Tampilkan pesan error detail jika ada
      if (axios.isAxiosError(err) && err.response) {
        // Tampilkan seluruh error detail dari backend
        const detail = typeof err.response.data === "string"
          ? err.response.data
          : JSON.stringify(err.response.data);
        toast.error(detail || "Gagal menyimpan perubahan (400)");
      } else {
        toast.error("Gagal menyimpan perubahan");
      }
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token) {
      toast.error("User is not authenticated");
      return;
    }
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/data1/delete/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUsers = users.filter((u) => u.id !== userId);
      setUsers(updatedUsers);

      if (
        updatedUsers.length > 0 &&
        currentPage > Math.ceil(updatedUsers.length / usersPerPage)
      ) {
        setCurrentPage(Math.ceil(updatedUsers.length / usersPerPage));
      }
      toast.success("Pengguna berhasil dihapus");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Gagal menghapus pengguna");
    }
  };

  const filteredUsers = React.useMemo(() => {
    const searchTerm = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm) ||
        u.phone.includes(search) ||
        u.address.toLowerCase().includes(searchTerm) ||
        u.role.toLowerCase().includes(searchTerm)
    );
  }, [users, search]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <div className="text-gray-600">Memuat data pengguna...</div>
          </div>
      </div>
    );
  }

  if (error && !loading && !authLoading) {
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
                onClick={() => window.location.href = "/login"}
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
    // Default error UI
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
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
            onClick={() => {
              setError(null);
              setLoading(true);
              window.location.reload();
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md"
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
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
          <div className="flex-1 md:ml-64 p-2 sm:p-4 md:p-8 transition-all duration-200">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">Manajemen Pengguna</h1>
                <p className="text-gray-500">Kelola data pengguna sistem dengan mudah dan efisien</p>
              </div>
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
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
                      placeholder="Cari pengguna..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900"
                    />
                  </div>
                </div>
                <div className="mb-4 md:mb-0 md:ml-4 flex justify-end">
                  <Link href="/user/add" passHref>
                    <button className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md flex items-center">
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
                      Tambah Pengguna
                    </button>
                  </Link>
                </div>
              </div>
              {filteredUsers.length === 0 ? (
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
                    {users.length === 0
                      ? "Belum ada pengguna"
                      : "Pengguna tidak ditemukan"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {users.length === 0
                      ? "Mulai dengan menambahkan pengguna baru"
                      : "Coba dengan kata kunci lain"}
                  </p>
                  {users.length === 0 && (
                    <button
                      onClick={handleAddUser}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md"
                    >
                      Tambah Pengguna Pertama
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentUsers.map((user) => (
                      <UserCard
                        key={`user-${user.id}`}
                        user={user}
                        onEdit={handleEditUser}
                        onDelete={handleDeleteUser}
                      />
                    ))}
                  </div>
                </>
              )}
              {/* Sticky Pagination Footer */}
              {totalPages > 1 && (
                <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 border-t border-gray-200 sticky bottom-0 left-0 z-10 flex justify-center py-3 sm:py-4 mt-8 overflow-x-auto">
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
                      onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
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
              )}
            </div>
          </div>
          {showAddModal && (
            <AddUserModal
              onSave={handleSaveNewUser}
              onCancel={() => setShowAddModal(false)}
            />
          )}
          {editingUser && (
            <EditUserModal
              user={editingUser}
              onSave={handleSaveEditedUser}
              onCancel={() => setEditingUser(null)}
            />
          )}
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
