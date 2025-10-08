"use client";
import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";
import { FiPlus } from "react-icons/fi";
import axios from "axios";
import Link from "next/link";

const MediaDashboard = () => {
  const [activeTab, setActiveTab] = useState("photos");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [mediaData, setMediaData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/gallery`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMediaData(res.data);
      } catch (error) {
        console.error("Gagal ambil data media:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🎬 Modal control
  const openMediaModal = (src: string, type: "image" | "video") => {
    setSelectedMedia(src);
    setMediaType(type);
  };

  const closeModal = () => {
    setSelectedMedia(null);
    setMediaType(null);
  };

  // 🧩 Helper buat handle URL media
  const getMediaUrl = (media: string | null | undefined) => {
    if (!media || media === "") {
      // Debug log jika url kosong
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.warn("[Gallery] Media kosong, tampilkan placeholder");
      }
      return "/no-media.png";
    }
    if (media.startsWith("http")) return media;
    return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${media}`;
  };

  // 🔎 Filter data berdasarkan field image/video
  const filteredMedia =
    activeTab === "photos"
      ? mediaData.filter((m) => m.image)
      : mediaData.filter((m) => m.video);

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Epicmo Media Center
                </h1>
                <p className="text-gray-600 text-base mt-1">
                  Kelola semua foto dan video dengan tampilan yang menarik dan profesional.
                </p>
              </div>

              <Link href="/gallery/upload" prefetch={false}>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300">
                  <FiPlus className="text-lg" />
                  Tambah Media
                </button>
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { key: "photos", label: "Photos" },
                { key: "videos", label: "Videos" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-3 px-6 font-medium text-sm transition-all ${
                    activeTab === tab.key
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 rounded-t-lg"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Loader */}
            {loading && (
              <div className="text-center py-10 text-gray-500">
                Loading data...
              </div>
            )}

            {/* Media Grid */}
            {!loading && (
              <div className="animate-fadeIn">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  {activeTab === "photos" ? "Koleksi Foto" : "Koleksi Video"}
                </h2>

                {filteredMedia.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    Belum ada data media 😢
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredMedia.map((item) => {
                      const isVideo = activeTab === "videos";
                      const mediaUrl = isVideo ? getMediaUrl(item.video) : getMediaUrl(item.image);

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                          onMouseEnter={() =>
                            setHoveredItem(`${activeTab}-${item.id}`)
                          }
                          onMouseLeave={() => setHoveredItem(null)}
                          onClick={() =>
                            (mediaUrl && mediaUrl !== "/no-media.png") && openMediaModal(mediaUrl, isVideo ? "video" : "image")
                          }
                        >
                          <div className="relative">
                            {isVideo ? (
                              item.video && item.video !== "" ? (
                                <video
                                  src={item.video.startsWith('http') ? item.video : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.video}`}
                                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                                  controls={false}
                                  muted
                                  preload="metadata"
                                  poster={item.thumbnail || ""}
                                />
                              ) : (
                                <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400">No Video</div>
                              )
                            ) : (
                              item.image && item.image !== "" ? (
                                <img
                                  src={item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.image}`}
                                  alt={item.title || "Media"}
                                  className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                              )
                            )}
                            <div
                              className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ${
                                hoveredItem === `${activeTab}-${item.id}`
                                  ? "opacity-100"
                                  : "opacity-0"
                              }`}
                            >
                              <div className="bg-white text-blue-600 p-2 rounded-full shadow-md">
                                <svg
                                  className="w-6 h-6"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d={
                                      isVideo
                                        ? "M14.752 11.168l-6.518-3.773A1 1 0 007 8.118v7.764a1 1 0 001.234.97l6.518-1.857A1 1 0 0016 13.882V10.118a1 1 0 00-1.248-.95z"
                                        : "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    }
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2 truncate">
                              {item.title || "Tanpa Judul"}
                            </h3>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {item.description || "Tidak ada deskripsi"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {selectedMedia && (
          <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <div className="max-w-4xl max-h-full">
              {mediaType === "image" ? (
                <img
                  src={selectedMedia}
                  alt="Zoomed"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selectedMedia}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
};

export default MediaDashboard;
