"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import ProtectedRoute from "../../components/ProtectedRoute";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";
import AccessDenied from "../../components/AccessDenied";
import { useAuth } from "../../context/AuthContext";

export default function AddEvent() {
  const { role, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    operator: [""],
    meetupTime: "",
    arrivalTime: "",
    equipment: [""],
    note: "",
  });

  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [operatorOptions, setOperatorOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===================== FETCH EQUIPMENT =====================
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token tidak ditemukan, silakan login kembali");
          return;
        }

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/data2`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let data = res.data;
        if (data && data.data) data = data.data;
        setEquipmentOptions(Array.isArray(data) ? data : []);
      } catch {
        setError("Gagal memuat data equipment");
      }
    };

    fetchEquipment();
  }, []);

  // ===================== FETCH OPERATOR =====================
  useEffect(() => {
    const fetchOperator = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token tidak ditemukan, silakan login kembali");
          return;
        }

        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/data1`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let data = res.data;
        if (data && data.data) data = data.data;
        setOperatorOptions(Array.isArray(data) ? data : []);
      } catch {
        setError("Gagal memuat data operator");
      }
    };

    fetchOperator();
  }, []);

  // ===================== HANDLER UMUM =====================
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===================== OPERATOR =====================
  const handleOperatorChange = (index: number, value: string) => {
    const newOps = [...formData.operator];
    newOps[index] = value;
    setFormData((prev) => ({ ...prev, operator: newOps }));
  };

  const addOperatorField = () =>
    setFormData((prev) => ({ ...prev, operator: [...prev.operator, ""] }));

  const removeOperatorField = (index: number) => {
    if (formData.operator.length > 1) {
      const newOps = formData.operator.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, operator: newOps }));
    }
  };

  // filtered operators to prevent duplicate selection across selects
  const filteredOperatorOptions = (currentValue: string) => {
    const selectedIds = formData.operator.filter(Boolean).map((v) => String(v));
    return operatorOptions.filter((item) => {
      const idStr = String(item.id ?? item._id);
      // keep option if not selected elsewhere OR if it's the current select's value
      return !selectedIds.includes(idStr) || idStr === String(currentValue);
    });
  };

  // ===================== EQUIPMENT =====================
  const handleEquipmentChange = (index: number, value: string) => {
    const newEq = [...formData.equipment];
    newEq[index] = value;
    setFormData((prev) => ({ ...prev, equipment: newEq }));
  };

  const addEquipmentField = () =>
    setFormData((prev) => ({ ...prev, equipment: [...prev.equipment, ""] }));

  const removeEquipmentField = (index: number) => {
    if (formData.equipment.length > 1) {
      const newEq = formData.equipment.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, equipment: newEq }));
    }
  };

  // convert IDs to string for reliable comparison in selects
  const filteredEquipment = (currentValue: string) => {
    const selectedIds = formData.equipment.filter(Boolean).map((v) => String(v));
    return equipmentOptions.filter((item) => {
      const idStr = String(item.id ?? item._id);
      return !selectedIds.includes(idStr) || idStr === String(currentValue);
    });
  };

  // ===================== SUBMIT =====================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan, silakan login kembali");

      const equipmentIds = formData.equipment
        .map((id) => (id && !isNaN(Number(id)) ? Number(id) : null))
        .filter((id) => id !== null);

      const operatorIds = formData.operator
        .map((id) => (id && !isNaN(Number(id)) ? Number(id) : null))
        .filter((id) => id !== null);

      const newEvent = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        operator: operatorIds,
        meetupTime: formData.meetupTime,
        arrivalTime: formData.arrivalTime,
        equipment: equipmentIds,
        note: formData.note || "",
      };

      if (
        !newEvent.title ||
        !newEvent.date ||
        !newEvent.time ||
        !newEvent.location ||
        operatorIds.length === 0 ||
        !newEvent.meetupTime ||
        !newEvent.arrivalTime
      ) {
        throw new Error("Semua field wajib harus diisi");
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/events/add`,
        newEvent,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) router.push("/event");
      else throw new Error(response.data.message || "Gagal menambahkan event");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Terjadi kesalahan saat menambahkan event"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================== RENDER =====================
  if (!authLoading && role && role.toLowerCase() !== "admin") {
    return (
      <AccessDenied message="Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini." />
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="flex min-h-screen bg-gray-50 text-black dark:text-black">
          <div className="flex-1 py-8 px-4 md:pr-8">
            <Head>
              <title>Tambah Jadwal Event</title>
              <meta name="description" content="Tambah jadwal event baru" />
            </Head>

            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold mb-6 text-black">
                Tambah Jadwal Event
              </h1>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-600 font-medium">{error}</span>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit}>
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* === KIRI === */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Judul Event *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Masukkan judul event"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tanggal Event *
                          </label>
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Waktu Event *
                          </label>
                          <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lokasi *
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Masukkan lokasi event"
                        />
                      </div>

                      {/* Operator */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Operator *
                          </label>
                          <button
                            type="button"
                            onClick={addOperatorField}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Tambah Operator
                          </button>
                        </div>
                        {formData.operator.map((op, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <select
                              value={op || ""}
                              onChange={(e) =>
                                handleOperatorChange(i, e.target.value)
                              }
                              required
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Pilih operator...</option>
                              {filteredOperatorOptions(op).map((item) => (
                                <option
                                  key={String(item.id ?? item._id)}
                                  value={String(item.id ?? item._id)}
                                >
                                  {item.name ||
                                    item.operator_name ||
                                    "Tanpa Nama"}
                                </option>
                              ))}
                            </select>
                            {formData.operator.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeOperatorField(i)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* === KANAN === */}
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Waktu Kumpul *
                          </label>
                          <input
                            type="time"
                            name="meetupTime"
                            value={formData.meetupTime}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Waktu Tiba *
                          </label>
                          <input
                            type="time"
                            name="arrivalTime"
                            value={formData.arrivalTime}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Equipment */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-sm font-medium text-gray-700">
                            Equipment / Barang
                          </label>
                          <button
                            type="button"
                            onClick={addEquipmentField}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            + Tambah
                          </button>
                        </div>
                        {formData.equipment.map((eq, i) => (
                          <div key={i} className="flex gap-2 mb-2">
                            <select
                              value={eq || ""}
                              onChange={(e) =>
                                handleEquipmentChange(i, e.target.value)
                              }
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Pilih barang...</option>
                              {filteredEquipment(eq).map((item) => {
                                const idStr = String(item.id ?? item._id);
                                return (
                                  <option key={idStr} value={idStr}>
                                    {item.item_name || item.name || "Tanpa Nama"}
                                  </option>
                                );
                              })}
                            </select>
                            {formData.equipment.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeEquipmentField(i)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Catatan */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Catatan
                        </label>
                        <textarea
                          name="note"
                          value={formData.note}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Masukkan catatan tambahan..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tombol */}
                  <div className="flex justify-end gap-3 p-6 border-t">
                    <Link
                      href="/event"
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Batal
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? "Menyimpan..." : "Simpan Jadwal"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
