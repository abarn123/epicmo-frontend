"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://192.168.110.100:8080/data1/${userId}`)
        .then((res) => setUser(res.data))
        .catch(() => toast.error("Gagal mengambil data pengguna"));
      console.log("User ID:", userId);
    }
  }, [userId]);

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
        user
      );
      toast.success("Pengguna berhasil diperbarui");
    } catch (err) {
      toast.error("Gagal memperbarui pengguna");
    }
  };

  if (!user) return <div className="p-10">Memuat data pengguna...</div>;

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
