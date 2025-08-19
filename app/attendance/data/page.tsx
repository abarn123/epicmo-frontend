"use client";

import {
  FiCamera,
  FiCheck,
  FiX,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiUser,
} from "react-icons/fi";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";

interface AttendanceFormData {
  photo: string;
  user_id: string;
  name: string;
  date: string;
  time: string;
  status: "present" | "permission" | "sick";
}

interface UserData {
  user_id: string;
  name: string;
}

export default function AttendanceFormPage() {
  const router = useRouter();
  const { userId, userName } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [formData, setFormData] = useState<AttendanceFormData>({
    photo: "",
    user_id: userId ? String(userId) : "",
    name: userName || "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    status: "present",
  });

  // Update formData user_id dan name jika context berubah
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      user_id: userId ? String(userId) : "",
      name: userName || "",
    }));
  }, [userId, userName]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Tidak perlu fetch users, user diambil dari context

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setFormData((prev) => ({ ...prev, time: timeString }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Camera setup
  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    const initializeCamera = async () => {
      try {
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            facingMode: isMobile ? { exact: "user" } : "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          if (isMobile) {
            videoRef.current.style.transform = "scaleX(-1)";
          }
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Camera error:", err);
        setError("Akses kamera gagal. Pastikan izin diberikan.");
      }
    };

    initializeCamera();

    return () => {
      mediaStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    context.save();
    context.scale(-1, 1);
    context.drawImage(
      videoRef.current,
      -canvasRef.current.width,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
    context.restore();

    const photoData = canvasRef.current.toDataURL("image/jpeg");
    setCapturedPhoto(photoData);
    setFormData((prev) => ({ ...prev, photo: photoData }));
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setFormData((prev) => ({ ...prev, photo: "" }));
  };

  // Tidak perlu handleUserSelect

  const validateForm = (): boolean => {
    if (!formData.photo) {
      setError("Foto wajib diambil");
      return false;
    }
    if (!formData.user_id.trim()) {
      setError("User ID tidak ditemukan. Silakan login ulang.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const base64Photo = formData.photo.split(",")[1] || formData.photo;

      const payload = {
        user_id: formData.user_id,
        name: formData.name,
        date: formData.date,
        time: formData.time,
        status: formData.status,
        photo: base64Photo,
      };

      const response = await axios.post(
       `${process.env.NEXT_PUBLIC_API_URL}/data4`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          
          timeout: 10000,
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setSuccess(true);
        setTimeout(() => router.push("/attendance"), 1500);
      }
    } catch (err: any) {
      let errorMessage = "Terjadi kesalahan";
      if (err.response) {
        errorMessage =
          err.response.data?.message ||
          `Error ${err.response.status}: ${err.response.statusText}`;
      } else if (err.request) {
        errorMessage = "Tidak ada respon dari server";
      } else {
        errorMessage = err.message || "Error saat mengirim data";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Jangan izinkan user mengubah user_id dan name
    if (name === "id" || name === "name") return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="text-green-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Absensi Berhasil!
          </h3>
          <p className="text-gray-600 mb-6">
            Data absensi Anda telah berhasil disimpan.
          </p>
          <button
            onClick={() => router.push("/attendance")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Lihat Data Absensi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Formulir Absensi
            </h2>
            <p className="text-gray-600">
              Silakan lengkapi formulir absensi harian Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Camera Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-2">
                Foto Selfie
              </label>
              <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64 flex items-center justify-center">
                {capturedPhoto ? (
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              <div className="mt-3 flex justify-center gap-3">
                {capturedPhoto ? (
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <FiX className="mr-2" /> Ambil Ulang Foto
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    <FiCamera className="mr-2" /> Ambil Foto
                  </button>
                )}
              </div>
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="user_id"
                  className="block text-sm font-medium text-black mb-1"
                >
                  User ID
                </label>
                <input
                  type="text"
                  id="user_id"
                  name="user_id"
                  value={formData.user_id}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
                />
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Nama
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  readOnly
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Tanggal
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="time"
                    className="block text-sm font-medium text-black mb-1"
                  >
                    Waktu
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="time"
                      name="time"
                      required
                      readOnly
                      value={formData.time}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-black"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Status Kehadiran
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="present">Hadir</option>
                  <option value="permission">Izin</option>
                  <option value="sick">Sakit</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !capturedPhoto}
              className={`w-full flex items-center justify-center px-4 py-3 rounded-md text-white font-medium ${
                loading || !capturedPhoto
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                <>
                  <FiCheck className="mr-2" />
                  Simpan Absensi
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
