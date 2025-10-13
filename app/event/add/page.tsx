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
    operator: "",
    meetupTime: "",
    arrivalTime: "",
    equipment: [""], // default satu field kosong agar select muncul
    note: "",
  });

  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token tidak ditemukan, silakan login kembali");
          return;
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/data2`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let data = response.data;
        if (data && data.data) {
          data = data.data;
        }

        setEquipmentOptions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Gagal memuat data equipment");
        setEquipmentOptions([]);
      }
    };

    fetchEquipment();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEquipmentChange = (index: number, value: string) => {
    const newEquipment = [...formData.equipment];
    newEquipment[index] = value;
    setFormData((prev) => ({
      ...prev,
      equipment: newEquipment,
    }));
  };

  const addEquipmentField = () => {
    setFormData((prev) => ({
      ...prev,
      equipment: [...prev.equipment, ""],
    }));
  };

  const removeEquipmentField = (index: number) => {
    if (formData.equipment.length > 1) {
      const newEquipment = formData.equipment.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        equipment: newEquipment,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token tidak ditemukan, silakan login kembali");
      }

      // Kirim array id equipment yang valid (bukan kosong)
      const equipmentIds = formData.equipment
        .map((id) => id && !isNaN(Number(id)) ? Number(id) : null)
        .filter((id) => id !== null);

      const newEvent = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        operator: formData.operator,
        meetupTime: formData.meetupTime,
        arrivalTime: formData.arrivalTime,
        equipment: equipmentIds,
        note: formData.note || "",
      };

      // Validasi field wajib
      if (
        !newEvent.title ||
        !newEvent.date ||
        !newEvent.time ||
        !newEvent.location ||
        !newEvent.operator ||
        !newEvent.meetupTime ||
        !newEvent.arrivalTime
      ) {
        throw new Error("Semua field yang wajib diisi harus dilengkapi");
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

      if (response.data.status) {
        router.push("/event");
      } else {
        throw new Error(response.data.message || "Gagal menambahkan event");
      }
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



  // If authenticated but not admin -> show access denied
  if (!authLoading && role && role.toLowerCase() !== "admin") {
    return <AccessDenied message={"Akses ditolak. Anda tidak memiliki izin untuk mengakses halaman ini."} />;
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex-1 py-8 px-4 md:pr-8">
        <Head>
          <title>Tambah Jadwal Event</title>
          <meta name="description" content="Tambah jadwal event baru" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex-1">
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
                    Tambah Jadwal Event
                  </h1>
                  <p className="text-gray-500">
                    Buat jadwal event baru dengan detail lengkap
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-600 font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Informasi Event
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Kolom Kiri */}
                  <div className="space-y-6">
                    {/* Judul Event */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Judul Event *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Masukkan judul event"
                      />
                    </div>

                    {/* Tanggal dan Waktu */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          Tanggal Event *
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          Waktu Event *
                        </label>
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Lokasi */}
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Lokasi *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors mb-2"
                        placeholder="Masukkan lokasi event"
                      />
                      {formData.location && (
                        <div className="w-full h-48 rounded-lg overflow-hidden mt-2 border border-gray-300">
                          <iframe
                            title="Google Maps Picker"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(
                              formData.location
                            )}&output=embed`}
                          ></iframe>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Ketik alamat atau nama tempat untuk melihat preview di peta
                      </p>
                    </div>

                    {/* Operator */}
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Masukkan nama operator"
                      />
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="space-y-6">
                    {/* Waktu Kumpul dan Tiba */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          Waktu Kumpul di Kantor
                        </label>
                        <input
                          type="time"
                          name="meetupTime"
                          value={formData.meetupTime}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          Waktu Tiba di Lokasi
                        </label>
                        <input
                          type="time"
                          name="arrivalTime"
                          value={formData.arrivalTime}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Equipment/Barang */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-500">
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
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                className="px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                        {formData.equipment.length === 0 && (
                          <p className="text-sm text-gray-500 py-2">
                            Belum ada equipment yang dipilih
                          </p>
                        )}
                      </div>
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
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Masukkan catatan tambahan..."
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse md:flex-row gap-3 justify-end pt-8 mt-8 border-t border-gray-200">
                  <Link
                    href="/event"
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center"
                  >
                    Batal
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      <>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Simpan Jadwal
                      </>
                    )}
                  </button>
                </div>
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