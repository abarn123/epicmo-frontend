"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

type User = {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  role: string;
};

export default function EditUserPage() {
  const params = useSearchParams();
  const userId = params.get("id");
  const { token } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = () => {
    console.log("fetchUserData called");
    console.log("userId:", userId);
    console.log("token:", token);
    if (!userId) {
      setError("ID pengguna tidak ditemukan");
      setLoading(false);
      return;
    }
    if (!token) {
      setError("User is not authenticated");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    axios
      .get(`http://192.168.110.100:8080/data1/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 5000,
      })
      .then((res) => {
        console.log("User data fetched:", res.data);
        setUser(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          toast.error("Pengguna tidak ditemukan");
          setError("Pengguna tidak ditemukan");
        } else if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
          toast.error("Request timeout. Silakan coba lagi.");
          setError("Request timeout. Silakan coba lagi.");
        } else {
          toast.error("Gagal mengambil data pengguna");
          setError("Gagal mengambil data pengguna");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, [userId, token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await axios.put(
        `http://192.168.110.100:8080/data1/edit/${user.id}`,
        user,
        {
          headers: {
            Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
            withCredentials: true
        }
      );
      toast.success("Pengguna berhasil diperbarui");
    } catch (err) {
      toast.error("Gagal memperbarui pengguna");
    }
  };

  if (loading)
    return (
      <div className="p-10">
        <div>Memuat data pengguna...</div>
      </div>
    );

  if (error)
    return (
      <div className="p-10">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchUserData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Coba Lagi
        </button>
      </div>
    );

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4">Edit Pengguna</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          value={user.name}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          placeholder="Nama"
          required
        />
        <input
          type="email"
          name="email"
          value={user.email || ""}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          placeholder="Email"
        />
        <input
          type="tel"
          name="phone"
          value={user.phone}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          placeholder="Nomor Telepon"
          required
        />
        <input
          type="text"
          name="address"
          value={user.address}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
          placeholder="Alamat"
          required
        />
        <select
          name="role"
          value={user.role}
          onChange={handleChange}
          className="w-full border px-4 py-2 rounded"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Simpan Perubahan
        </button>
      </form>
    </div>
  );
}
