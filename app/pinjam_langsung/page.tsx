"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

interface Tool {
  id: number;
  item_name: string;
  stock: number;
  item_condition: string;
  category: string;
  selected: boolean;
  quantity: number;
}

interface BorrowFormData {
  user_id: number | null;
  date_borrow: string;
  date_return: string | null;
  tools_status: string;
  due_date: string;
  reason: string;
}

export default function BorrowFromEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams?.get("id") ?? null;
  const { token, userName, userId } = useAuth();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const [event, setEvent] = useState<any>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyBorrowed, setAlreadyBorrowed] = useState(false); // ✅ tambahan: kontrol tombol hilang

  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 7);

  const [formData, setFormData] = useState<BorrowFormData>({
    user_id: null,
    date_borrow: new Date().toISOString().split("T")[0],
    date_return: null,
    tools_status: "borrowed",
    due_date: defaultDueDate.toISOString().split("T")[0],
    reason: "",
  });

  useEffect(() => {
    if (userId) {
      setFormData((prev) => ({ ...prev, user_id: userId }));
    }
  }, [userId]);

  // Ambil data event dan alat terkait
  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const evt = res.data?.data ?? res.data;
        setEvent(evt);

        const equipmentList = Array.isArray(evt?.equipment)
          ? evt.equipment
          : [];

        // Normalisasi data alat
        const normalizedTools: Tool[] = equipmentList.map((item: any) => ({
          id: item.id ?? item._id ?? item.tools_id ?? 0,
          item_name: item.name ?? item.item_name ?? "Tidak diketahui",
          stock: item.stock ?? item.available_stock ?? 0,
          item_condition: item.item_condition ?? "Baik",
          category: item.category ?? "Lainnya",
          selected: true,
          quantity: 1,
        }));

        setTools(normalizedTools);
      } catch (err) {
        console.error("❌ Gagal memuat event:", err);
        toast.error("Gagal memuat data event");
        setError("Gagal memuat data event");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, API_BASE]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 // (kode penuh sama seperti punyamu di atas, hanya bagian handleSubmit diubah)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (alreadyBorrowed) return;
  setSubmitting(true);
  setError(null);

  try {
    if (!token) throw new Error("Not authenticated");
    if (!formData.user_id) {
      toast.error("User ID belum tersedia. Silakan tunggu sebentar...");
      setSubmitting(false);
      return;
    }



      // Validasi tanggal
      const borrowDate = new Date(formData.date_borrow);
      const dueDate = new Date(formData.due_date);
      if (dueDate <= borrowDate) {
        throw new Error("Tanggal batas peminjaman harus setelah tanggal peminjaman");
      }

      // Validasi alasan
      if (!formData.reason.trim()) {
        throw new Error("Alasan peminjaman harus diisi");
      }

      const selectedTools = tools;
      if (selectedTools.length === 0) {
        throw new Error("Tidak ada alat untuk dipinjam");
      }

      const payload = {
        user_id: formData.user_id,
        tools_status: "borrowed",
        tools: selectedTools.map((tool) => ({
          tools_id: tool.id,
          quantity: tool.quantity,
        })),
        date_borrow: formData.date_borrow,
        date_return: null,
        due_date: formData.due_date,
        reason: formData.reason,
        event_id: eventId,
      };

      console.log("Payload dikirim:", payload);

      const res = await axios.post(`${API_BASE}/data3/add`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const responseData = res.data ?? res;
      if (!(res.status >= 200 && res.status < 300)) {
        throw new Error(responseData?.message || "Gagal mengirim permintaan peminjaman");
      }

      toast.success(responseData.message || "Berhasil meminjam alat dari event!");
      localStorage.setItem("refreshBorrowRecords", Date.now().toString());
return router.push("/log_tools");
      // ✅ ubah status jadi sudah pinjam & sembunyikan tombol
      setAlreadyBorrowed(true);
    } catch (err: any) {
      console.error("❌ Gagal kirim:", err);
      const message = err.message || "Gagal mengirim permintaan";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Memuat data event...</div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const toolsByCategory = tools.reduce((acc, tool) => {
    const category = tool.category ?? "Lainnya";
    if (!acc[category]) acc[category] = [];
    acc[category].push(tool);
    return acc;
  }, {} as Record<string, Tool[]>);

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-lg font-medium text-black">
                  Formulir Peminjaman Alat dari Event
                </h3>
                <p className="mt-1 text-sm text-black">
                  Event: {event?.title || event?.name || "Tidak diketahui"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                {/* Daftar Alat */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-black mb-4">
                    Daftar Alat dari Event ({tools.length})
                  </h4>
                  <div className="border border-gray-200 rounded-lg">
                    {Object.entries(toolsByCategory).map(
                      ([category, categoryTools]) => (
                        <div key={category}>
                          <div className="bg-blue-50 px-4 py-2 font-semibold text-blue-800">
                            {category}
                          </div>
                          {categoryTools.map((tool) => (
                            <div
                              key={tool.id}
                              className="px-4 py-3 flex justify-between border-b last:border-none"
                            >
                              <div className="text-sm text-black">
                                {tool.item_name}
                              </div>
                              <div className="text-sm text-gray-700">
                                Jumlah: {tool.quantity}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Informasi */}
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-black">
                      Tanggal Peminjaman
                    </label>
                    <input
                      type="date"
                      name="date_borrow"
                      value={formData.date_borrow}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border rounded-md text-black"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-sm font-medium text-black">
                      Batas Pengembalian
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleInputChange}
                      className="mt-1 block w-full p-2 border rounded-md text-black"
                    />
                  </div>
                  <div className="col-span-6">
                    <label className="block text-sm font-medium text-black">
                      Alasan Peminjaman
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full p-2 border rounded-md text-black"
                      placeholder="Tuliskan alasan peminjaman"
                    ></textarea>
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-6 text-right">
                  <button
                    type="button"
                    onClick={() => router.push("/event")}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg mr-2"
                  >
                    Batal
                  </button>

                  {!alreadyBorrowed ? (
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                    >
                      {submitting ? "Memproses..." : "Konfirmasi Pinjam"}
                    </button>
                  ) : (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                      ✅ Sudah Pinjam
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
