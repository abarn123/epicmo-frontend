"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import axios from "axios";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

export default function EventSchedule() {
  const router = useRouter();

  const [events, setEvents] = useState<any[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [loadingDelete, setLoadingDelete] = useState<string | number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // 🔹 Ambil semua data (event, equipment, operator)
  useEffect(() => {
    const initData = async () => {
      try {
        const storedRole = localStorage.getItem("role");
        if (storedRole) setRole(storedRole.toLowerCase());

        await Promise.allSettled([
          fetchEventsFromApi(),
          fetchEquipmentOptions(),
          fetchOperators(),
        ]);
      } catch (err) {
        console.error("❌ Gagal memuat data awal:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // 🔹 Ambil data Event
  const fetchEventsFromApi = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const response = await axios.get(`${API_BASE}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data ?? response.data ?? [];
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ Gagal mengambil data event:", err?.response?.data || err);
      setEvents([]);
    }
  };

  // 🔹 Ambil data Equipment (data2)
  const fetchEquipmentOptions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_BASE}/data2`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data ?? response.data ?? [];
      setEquipmentOptions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ Gagal mengambil data equipment:", err?.response?.data || err);
      setEquipmentOptions([]);
    }
  };

  // 🔹 Ambil data Operator (data1/user)
  const fetchOperators = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_BASE}/data1`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data?.data ?? response.data ?? [];
      setOperators(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("❌ Gagal mengambil data operator:", err?.response?.data || err);
      setOperators([]);
    }
  };

  // 🔹 Ambil nama equipment
  const getEquipmentName = (id: string | number) => {
    const eq = equipmentOptions.find(
      (item) => String(item.id) === String(id) || String(item._id) === String(id)
    );
    return eq ? eq.item_name : id;
  };

  // ✅ Ambil nama operator langsung dari data1/user tanpa ID
  const getOperatorName = (operatorData: any) => {
    if (!operatorData) return "Tidak ditemukan";

    // Kalau array
    if (Array.isArray(operatorData)) {
      const names = operatorData
        .map(
          (op) =>
            op?.fullname ||
            op?.name ||
            op?.username ||
            op?.operator_name ||
            op?.nama
        )
        .filter(Boolean);
      return names.length > 0 ? names.join(", ") : "Tidak ditemukan";
    }

    // Kalau objek tunggal
    if (typeof operatorData === "object") {
      return (
        operatorData.fullname ||
        operatorData.name ||
        operatorData.username ||
        operatorData.operator_name ||
        operatorData.nama ||
        "Tidak ditemukan"
      );
    }

    // Kalau string (fallback)
    return String(operatorData);
  };

  // 🔹 Hapus Event
  const handleDelete = async (eventId: string | number) => {
    setLoadingDelete(eventId);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/events/delete/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents((prev) =>
        prev.filter((ev) => String(ev.id) !== String(eventId) && String(ev._id) !== String(eventId))
      );
      setConfirmDeleteId(null);
    } catch (err: any) {
      console.error("❌ Gagal menghapus event:", err?.response?.data || err);
      alert("Gagal menghapus event.");
    } finally {
      setLoadingDelete(null);
    }
  };

  // 🔹 Edit Event
  const handleEdit = (eventId: string | number | undefined) => {
    if (!eventId) return alert("ID event tidak ditemukan!");
    router.push(`/event/edit?id=${eventId}`);
  };

  // 🔹 Loading tampilan
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">Memuat data event...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex-1 py-8 px-4 md:pr-8">
            <Head>
              <title>Jadwal Event</title>
              <meta name="description" content="Halaman jadwal event dengan peta dan detail" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-gray-800 mb-1">Jadwal Event</h1>
                <p className="text-gray-500">Kelola jadwal event dan peralatan yang diperlukan</p>
              </div>

              {role !== "freelance" && (
                <div className="flex justify-end">
                  <Link
                    href="/event/add"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Jadwal
                  </Link>
                </div>
              )}
            </div>

            {/* Daftar Event */}
            <div className="grid gap-6">
              {events.map((event) => {
                const eventId = event.id || event._id;
                return (
                  <div key={eventId} className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                      <h1 className="text-3xl font-bold text-gray-800 mb-2 md:mb-0">{event.title}</h1>
                      <div className="text-gray-600">
                        <span className="font-medium">Waktu Event : {event.date}</span>
                        <span className="mx-2">•</span>
                        <span>{event.time}</span>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Lokasi</h3>
                            <p className="text-gray-900">{event.location}</p>
                          </div>

                          {/* ✅ Operator langsung tampil nama dari data1 */}
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Operator</h3>
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(event.operator) ? event.operator : [event.operator]).map(
                                (op: any, i: number) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                                  >
                                    {getOperatorName(op)}
                                  </span>
                                )
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Waktu Kumpul</h3>
                            <p className="text-gray-900">{event.meetupTime}</p>
                          </div>

                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Tiba di Lokasi</h3>
                            <p className="text-gray-900">{event.arrivalTime}</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Equipment</h3>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(event.equipment) ? event.equipment : []).map((item: any, i: number) => (
                              <span
                                key={item.id || i}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                              >
                                {item.item_name ? item.item_name : getEquipmentName(item.id ?? item)}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Catatan</h3>
                          <p className="text-gray-900">{event.note}</p>
                        </div>

                        {role !== "freelance" && (
                          <div className="flex gap-2 pt-2">
                            <Link
                              href={`/event/edit?id=${eventId}`}
                              className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600"
                            >
                              Edit
                            </Link>

                            {confirmDeleteId === eventId ? (
                              <>
                                <button
                                  onClick={() => handleDelete(eventId)}
                                  disabled={loadingDelete === eventId}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                                >
                                  {loadingDelete === eventId ? "Menghapus..." : "Konfirmasi"}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                  Batal
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(eventId)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 🔹 Peta Lokasi */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <iframe
                          title={`Google Map ${event.location}`}
                          width="100%"
                          height="180"
                          style={{ border: 0, borderRadius: "0.75rem" }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
                        ></iframe>
                        <p className="text-sm text-gray-400 mt-2">Peta Lokasi: {event.location}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tidak ada event */}
            {events.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum ada jadwal event</h3>
                <p className="text-gray-500 mb-4">Mulai dengan menambahkan jadwal event pertama Anda</p>
              </div>
            )}
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
