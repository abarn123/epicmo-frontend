"use client";

import {
  FiCamera,
  FiCheck,
  FiX,
  FiClock,
  FiCalendar,
  FiRefreshCw,
  FiEdit3,
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
  status: "ready" | "finish";
  note: string;
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
    status: "ready",
    note: "",
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
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Cek kamera tersedia
  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (err) {
        console.error("Error checking cameras:", err);
      }
    };
    checkCameras();
  }, []);

  // Update waktu setiap detik
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

  // Setup kamera
  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    const initializeCamera = async () => {
      try {
        if (mediaStream) mediaStream.getTracks().forEach((t) => t.stop());
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.style.transform =
            facingMode === "user" ? "scaleX(-1)" : "scaleX(1)";
        }
        setStream(mediaStream);
      } catch (err) {
        console.error("Camera error:", err);
        setError("Akses kamera gagal. Pastikan izin diberikan.");
      }
    };
    initializeCamera();
    return () => mediaStream?.getTracks().forEach((t) => t.stop());
  }, [facingMode]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setCapturedPhoto(null);
    setFormData((prev) => ({ ...prev, photo: "" }));
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const context = canvasRef.current.getContext("2d");
    if (!context) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.save();
    if (facingMode === "user") {
      context.scale(-1, 1);
      context.drawImage(
        videoRef.current,
        -canvasRef.current.width,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    } else {
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
    context.restore();
    const photoData = canvasRef.current.toDataURL("image/jpeg");
    setCapturedPhoto(photoData);
    setFormData((prev) => ({ ...prev, photo: photoData }));
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setFormData((prev) => ({ ...prev, photo: "" }));
  };

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

  // ✅ Fungsi untuk format catatan dengan auto line break
  const formatNoteWithAutoLineBreak = (text: string): string => {
    if (!text) return "";

    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    let wordCount = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      // Cek apakah sudah 5 kata atau lebih dari 80 karakter
      wordCount++;

      if (wordCount > 5 || testLine.length > 80) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
          wordCount = 1;
        } else {
          // Jika satu kata saja sudah lebih dari 80 karakter, potong
          if (word.length > 80) {
            for (let j = 0; j < word.length; j += 80) {
              lines.push(word.substring(j, j + 80));
            }
            currentLine = "";
            wordCount = 0;
          } else {
            currentLine = word;
          }
        }
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.join("\n");
  };

  // Kirim data ke API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const base64Photo = formData.photo.split(",")[1] || formData.photo;

      // ✅ Format catatan sebelum dikirim
      const formattedNote = formatNoteWithAutoLineBreak(formData.note);

      const payload = {
        user_id: formData.user_id,
        name: formData.name,
        date: formData.date,
        time: formData.time,
        status: formData.status,
        note: formattedNote, // ✅ Kirim catatan yang sudah diformat
        photo: base64Photo,
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/data4/add`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (res.status >= 200 && res.status < 300) {
        setSuccess(true);
        setTimeout(() => router.push("/attendance"), 1500);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gagal menyimpan absensi");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="text-green-500 mb-4">
            <FiCheck className="w-16 h-16 mx-auto" />
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
          {/* Header with Back Button */}
          <div className="relative flex items-center mb-6">
            <a
              href="/attendance"
              className="absolute left-0 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Kembali"
            >
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </a>
            <div className="flex-1 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Formulir Absensi
              </h2>
              <p className="text-gray-600">
                Silakan lengkapi formulir absensi harian Anda
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Camera Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-black">
                  Foto Selfie
                </label>
                {hasMultipleCameras && !capturedPhoto && (
                  <button
                    type="button"
                    onClick={switchCamera}
                    className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition"
                  >
                    <FiRefreshCw className="mr-1" />
                    {facingMode === "user" ? "Kamera Belakang" : "Kamera Depan"}
                  </button>
                )}
              </div>

              <div className="relative bg-gray-100 rounded-lg overflow-hidden h-64 flex items-center justify-center border-2 border-gray-300">
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
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                  >
                    <FiX className="mr-2" /> Ambil Ulang Foto
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
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
                  htmlFor="name"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Nama
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
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
                    <FiCalendar className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
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
                    <FiClock className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      id="time"
                      name="time"
                      readOnly
                      value={formData.time}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
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
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                >
                  <option value="ready">Sudah siap</option>
                  <option value="finish">Telah selesai</option>
                </select>
              </div>

              {/* ✅ Field catatan dengan info auto line break */}
              <div>
                <label
                  htmlFor="note"
                  className="block text-sm font-medium text-black mb-1"
                >
                  Catatan (Opsional)
                </label>
                <div className="relative">
                  <FiEdit3 className="absolute left-3 top-3 text-gray-400" />
                  <textarea
                    id="note"
                    name="note"
                    rows={4}
                    placeholder="Tulis keterangan tambahan di sini..."
                    value={formData.note}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black resize-none"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  💡 Catatan otomatis turun baris setiap 5 kata atau 80 karakter
                </p>
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
              className={`w-full flex items-center justify-center px-4 py-3 rounded-md text-white font-medium transition ${
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
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
