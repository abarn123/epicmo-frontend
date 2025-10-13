"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import ProtectedRoute from "../../components/ProtectedRoute";
import AuthenticatedLayout from "../../components/AuthenticatedLayout";


export default function EditEvent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    operator: "",
    meetupTime: "",
    arrivalTime: "",
    equipment: [""],
    note: "",
  });

  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchEquipment = async (token: string) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/data2`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data?.data ?? res.data;
      setEquipmentOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal mengambil equipment:", err);
      setEquipmentOptions([]);
    }
  };

  const fetchEventData = async (token: string, eventId: string) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data?.data ?? res.data;

      setFormData({
        title: data.title || "",
        date: data.date?.slice(0, 10) || "", // pastikan format date cocok untuk input[type=date]
        time: data.time || "",
        location: data.location || "",
        operator: data.operator || "",
        meetupTime: data.meetupTime || "",
        arrivalTime: data.arrivalTime || "",
        equipment:
          Array.isArray(data.equipment) && data.equipment.length > 0
            ? data.equipment.map((eq: any) =>
                String(eq.id || eq._id || eq)
              )
            : [""],
        note: data.note || "",
      });
    } catch (err: any) {
      console.error("Gagal mengambil data event:", err);
      setError(
        err?.response?.data?.message ||
          "Gagal mengambil data event. Pastikan ID valid."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }
    if (!eventId) return; // tunggu sampai ID ada

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEquipment(token), fetchEventData(token, eventId)]);
      setLoading(false);
    };

    loadData();
  }, [eventId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEquipmentChange = (index: number, value: string) => {
    const newEquipment = [...formData.equipment];
    newEquipment[index] = value;
    setFormData((prev) => ({ ...prev, equipment: newEquipment }));
  };

  const addEquipmentField = () =>
    setFormData((prev) => ({
      ...prev,
      equipment: [...prev.equipment, ""],
    }));

  const removeEquipmentField = (index: number) => {
    if (formData.equipment.length > 1) {
      const newEquipment = formData.equipment.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, equipment: newEquipment }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const equipmentIds = formData.equipment
        .map((id) => (id && !isNaN(Number(id)) ? Number(id) : id))
        .filter((id) => id);

      const updatedEvent = {
        ...formData,
        equipment: equipmentIds,
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/events/edit/${eventId}`,
        updatedEvent,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Event berhasil diperbarui!");
      router.push("/event");
    } catch (err: any) {
      console.error("Error updating event:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Terjadi kesalahan saat memperbarui event"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        Memuat data event...
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex-1 py-8 px-4 md:pr-8">
        <Head>
          <title>Edit Jadwal Event</title>
        </Head>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex items-center mb-4">
              <Link
                href="/event"
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                  Edit Jadwal Event
                </h1>
                <p className="text-gray-500">
                  Ubah detail event dan simpan perubahan
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* FORM */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Informasi Event
                </h2>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* FORM KIRI */}
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
                    />
                    {formData.location && (
                      <div className="w-full h-48 rounded-lg overflow-hidden mt-2 border border-gray-300">
                        <iframe
                          title="Google Maps"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          src={`https://www.google.com/maps?q=${encodeURIComponent(
                            formData.location
                          )}&output=embed`}
                        ></iframe>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Operator *
                    </label>
                    <input
                      type="text"
                      name="operator"
                      value={formData.operator}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* FORM KANAN */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waktu Kumpul di Kantor
                      </label>
                      <input
                        type="time"
                        name="meetupTime"
                        value={formData.meetupTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Waktu Tiba di Lokasi
                      </label>
                      <input
                        type="time"
                        name="arrivalTime"
                        value={formData.arrivalTime}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Equipment/Barang
                      </label>
                      <button
                        type="button"
                        onClick={addEquipmentField}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        + Tambah Equipment
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.equipment.map((equipmentId, index) => (
                        <div key={index} className="flex gap-2">
                          <select
                            value={equipmentId || ""}
                            onChange={(e) =>
                              handleEquipmentChange(index, e.target.value)
                            }
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Pilih barang...</option>
                            {equipmentOptions.map((eq) => (
                              <option
                                key={eq.id ?? eq._id}
                                value={eq.id ?? eq._id}
                              >
                                {eq.item_name}
                              </option>
                            ))}
                          </select>
                          {formData.equipment.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEquipmentField(index)}
                              className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

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
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-3 justify-end pt-8 mt-8 border-t border-gray-200 p-6">
                <Link
                  href="/event"
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 text-center"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
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
