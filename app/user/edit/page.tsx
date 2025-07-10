"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

const Edit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setMessage("ID pengguna tidak ditemukan di URL.");
      setIsLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://192.168.110.100:8080/data1/edit/${id}`);
        if (response.data) {
          setFormData(response.data);
        } else {
          // Jika data kosong, tetap tampilkan form kosong tanpa error
          setFormData({
            name: "",
            phone: "",
            address: "",
            role: "",
          });
        }
      } catch (error: any) {
        // Jika 404, tetap tampilkan form kosong tanpa pesan error
        if (error.response && error.response.status === 404) {
          setFormData({
            name: "",
            phone: "",
            address: "",
            role: "",
          });
        } else {
          setMessage("Gagal memuat data pengguna: " + error.message);
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
    try {
      const response = await axios.put(
        `http://192.168.110.100:8080/data1/edit/${id}`,
        formData
      );

      if (response.data.status) {
        setMessage("Data pengguna berhasil diupdate!");
        setIsSuccess(true);
        setTimeout(() => router.push("/user"), 2000);
      } else {
        setMessage("Gagal mengupdate data: " + response.data.message);
        setIsSuccess(false);
      }
    } catch (error: any) {
      setMessage("Error: " + (error.response?.data?.message || error.message));
      setIsSuccess(false);
    }
  };

  if (isLoading) {
    return <div>Memuat data...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h2 className="text-2xl font-bold mb-4">Edit Pengguna</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Nama</label>
          <input
            type="text"
            name="name"
            className="w-full p-2 border rounded"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Nomor Telepon</label>
          <input
            type="text"
            name="phone"
            className="w-full p-2 border rounded"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Alamat</label>
          <input
            type="text"
            name="address"
            className="w-full p-2 border rounded"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Role</label>
          <input
            type="text"
            name="role"
            className="w-full p-2 border rounded"
            value={formData.role}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Update
        </button>
      </form>
      {message && (
        <p
          className={`mt-4 p-2 rounded ${
            isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Edit;