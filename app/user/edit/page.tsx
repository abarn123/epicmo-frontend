"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

interface UserData {
  name: string;
  phone: string;
  address: string;
  role: string;
}

const edit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState<UserData>({
    name: "",
    phone: "",
    address: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data user saat komponen mount
  useEffect(() => {
    if (!id) {
      setMessage("ID pengguna tidak ditemukan di URL.");
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://192.168.110.100:8080/data1/${id}`);
        
        // Sesuaikan dengan struktur response backend
        if (response.data) {
          setFormData({
            name: response.data.name || "",
            phone: response.data.phone || "",
            address: response.data.address || "",
            role: response.data.role || "",
          });
        } else {
          setFormData({
            name: "",
            phone: "",
            address: "",
            role: "",
          });
        }
      } catch (error: any) {
        // Jika error 404 (data tidak ditemukan), tetap tampilkan form kosong tanpa error
        if (error.response && error.response.status === 404) {
          setFormData({
            name: "",
            phone: "",
            address: "",
            role: "",
          });
          setMessage(""); // Tidak tampilkan error
        } else {
          setMessage(`Gagal memuat data: ${error.response?.data?.message || error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      setMessage("ID pengguna tidak valid");
      return;
    }

    try {
      setIsLoading(true);
      
      // Sesuaikan dengan endpoint dan format data yang diharapkan backend
      const response = await axios.put(
        `http://192.168.110.100:8080/data1/edit/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Sesuaikan pengecekan response dengan struktur dari backend
      if (response.data.status === true) {
        setMessage(response.data.message || "Data berhasil diupdate!");
        setIsSuccess(true);
        setTimeout(() => router.push("/user"), 2000);
      } else {
        setMessage(response.data.message || "Gagal mengupdate data");
        setIsSuccess(false);
      }
    } catch (error: any) {
      // Tangani error sesuai response backend
      if (error.response) {
        if (error.response.status === 400) {
          setMessage("Data tidak valid: " + (error.response.data.message || "Silakan periksa input Anda"));
        } else if (error.response.status === 500) {
          setMessage("Server error: " + (error.response.data.message || "Terjadi kesalahan pada server"));
        } else {
          setMessage(`Error ${error.response.status}: ${error.response.data.message || "Terjadi kesalahan"}`);
        }
      } else {
        setMessage("Error: " + error.message);
      }
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-md text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p>Memuat data pengguna...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Edit Pengguna</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Nama</label>
          <input
            type="text"
            name="name"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Nomor Telepon</label>
          <input
            type="tel"
            name="phone"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Alamat</label>
          <input
            type="text"
            name="address"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.address}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Role</label>
          <input
            type="text"
            name="role"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={formData.role}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div className="flex space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 disabled:bg-blue-300"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Update"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-500 text-white py-2 px-6 rounded hover:bg-gray-600"
            disabled={isLoading}
          >
            Batal
          </button>
        </div>
      </form>
      {message && isSuccess && (
        <div className="mt-4 p-3 rounded bg-green-100 text-green-800">
          {message}
        </div>
      )}
    </div>
  );
};

export default edit;