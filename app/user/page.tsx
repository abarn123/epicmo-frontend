"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  phone: string;
  address: string;
  role: string;
  email?: string;
};

type UserGridProps = {
  users?: User[];
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  onAdd?: () => void;
};

function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col space-y-4 border border-gray-100 hover:shadow-2xl transition">
      <div className="flex items-center space-x-4">
        <div className="bg-indigo-100 rounded-full h-12 w-12 flex items-center justify-center text-indigo-600 font-bold text-lg">
          {user.name[0]}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
          <span className="text-xs text-gray-400">{user.role}</span>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <div>
          <span className="font-semibold">Email:</span> {user.email || "-"}
        </div>
        <div>
          <span className="font-semibold">No. Telepon:</span> {user.phone}
        </div>
        <div>
          <span className="font-semibold">Alamat:</span> {user.address}
        </div>
      </div>
      <div className="flex space-x-2 mt-2">
        {onEdit && (
          <button
            className="flex-1 px-3 py-1 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
            onClick={() => onEdit(user)}
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            className="flex-1 px-3 py-1 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
            onClick={() => onDelete(user.id)}
          >
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}

function AddUserModal({ 
  onSave, 
  onCancel 
}: {
  onSave: (user: Omit<User, 'id'>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    name: "",
    phone: "",
    address: "",
    role: "user",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Tambah User Baru</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. Telepon
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
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
              className="w-full px-3 py-2 border rounded-md"
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
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border rounded-md"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement({
  users: initialUsers = [],
  onEdit,
  onDelete,
  onAdd,
}: UserGridProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://192.168.110.100:8080/data1");
        console.log("API Response:", response.data);

        let usersData = response.data;
        if (usersData && typeof usersData === "object" && !Array.isArray(usersData)) {
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
            email: u.email || "",
          };
        });

        const idSet = new Set();
        const duplicates = processedUsers.filter(user => {
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
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleAddUser = () => {
    if (onAdd) {
      onAdd();
    } else {
      setShowAddModal(true);
    }
  };

  const handleSaveNewUser = async (newUser: Omit<User, 'id'>) => {
    try {
      const response = await axios.post("http://192.168.110.100:8080/data1", newUser);
      const createdUser = {
        ...newUser,
        id: response.data.id || `generated-${Date.now()}`,
      };
      setUsers([...users, createdUser]);
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding user:", err);
      setError("Gagal menambahkan user");
      const createdUser = {
        ...newUser,
        id: `generated-${Date.now()}`,
      };
      setUsers([...users, createdUser]);
      setShowAddModal(false);
    }
  };

  const filteredUsers = React.useMemo(() => {
    const searchTerm = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm) ||
        u.phone.includes(search) ||
        u.address.toLowerCase().includes(searchTerm) ||
        u.role.toLowerCase().includes(searchTerm) ||
        (u.email && u.email.toLowerCase().includes(searchTerm))
    );
  }, [users, search]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
        <Sidebar />
        <main className="flex-1 p-8 ml-64 flex items-center justify-center">
          <div className="animate-pulse">Memuat data user...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
        <Sidebar />
        <main className="flex-1 p-8 ml-64 flex flex-col items-center justify-center">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Coba Lagi
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-indigo-800 mb-1">
              Manajemen User
            </h1>
            <p className="text-gray-500">
              Kelola data user aplikasi Anda dengan mudah.
            </p>
          </div>
          <div className="mb-4 md:mb-0 md:ml-4 flex justify-end">
            <Link href="/user/add">
  <button
    className="px-5 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition whitespace-nowrap inline-flex items-center justify-center"
  >
    + Tambah User
  </button>
</Link>
          </div>
        </div>
        <div className="mb-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Cari user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition w-full text-gray-900"
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-lg">
              {users.length === 0
                ? "Tidak ada user tersedia"
                : "Tidak ada user yang cocok dengan pencarian"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <UserCard
                key={`user-${user.id}`}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}

        {showAddModal && (
          <AddUserModal
            onSave={handleSaveNewUser}
            onCancel={() => setShowAddModal(false)}
          />
        )}
      </main>
    </div>
  );
}