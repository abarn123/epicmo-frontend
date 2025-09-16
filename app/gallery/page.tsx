"use client";
import React, { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

const MediaDashboard = () => {
  const [activeTab, setActiveTab] = useState("photos");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  // Data contoh untuk foto
  const photos = [
    {
      id: 1,
      src: "https://epicmo.id/assets/images/gallery/gallery-1.png",
      title: "Epicmo",
      description:
        "Bukan Sekadar Foto,Tapi Pengalaman yang Nempel di Hati! ",
    },
    {
      id: 2,
      src: "https://epicmo.id/assets/images/gallery/gallery-2.png",
      title: "Epicmo",
      description:
        "Bukan Sekadar Foto,Tapi Pengalaman yang Nempel di Hati! ",
      
    },
    {
      id: 3,
      src: "https://epicmo.id/assets/images/gallery/gallery-3.png",
      title: "Epicmo",
      description:
        "Bukan Sekadar Foto,Tapi Pengalaman yang Nempel di Hati! ",
    
    },
    {
      id: 4,
      src: "https://epicmo.id/assets/images/gallery/gallery-4.png",
      title: "Epicmo",
      description:
        "Bukan Sekadar Foto,Tapi Pengalaman yang Nempel di Hati! ",
      
    },
    {
      id: 5,
      src: "https://epicmo.id/assets/images/gallery/gallery-5.png",
      title: "Epicmo",
      description:
        "Bukan Sekadar Foto,Tapi Pengalaman yang Nempel di Hati! ",
      
    },
    {
      id: 6,
      src: "https://epicmo.id/assets/images/gallery/gallery-6.png",
      title: "Epicmo",
      description:
        "Bukan Sekadar Foto,Tapi Pengalaman yang Nempel di Hati! ",
      
    },
    {
      id: 7,
      src: "https://epicmo.id/assets/images/gallery/gallery-7.png",
      title: "Epicmo",
      description:
        "Bukan Sekadar Foto,Tapi Pengalaman yang Nempel di Hati! ",
      
    },
    {
      id: 8,
      src: "https://epicmo.id/assets/images/gallery/gallery-8.png",
      title: "Epicmo",
      description:
        "Bukan Sekadar Foto,Tapi Pengalaman yang Nempel di Hati! ",
      
    },
  ];

  // Data contoh untuk video - Diperbaiki dengan poster YouTube yang benar dan deskripsi yang sesuai
  const videos = [
    {
      id: 1,
      src: "9PqgOI1YmA8", // ID YouTube 
      poster: "https://img.youtube.com/vi/9PqgOI1YmA8/maxresdefault.jpg",
      title: "testimoni 5",
      description:
        "Bukan Sekadar Video,Tapi Pengalaman yang Nempel di Hati!",
      duration: "00:17",
      
    },
    {
      id: 2,
      src: "M-fl7QHc-I4", // ID YouTube 
      poster: "https://img.youtube.com/vi/M-fl7QHc-I4/maxresdefault.jpg",
      title: "Testimoni 6",
      description:
        "Bukan Sekadar Video,Tapi Pengalaman yang Nempel di Hati!",
      duration: "00:08",
      
    },
    {
      id: 3,
      src: "i-WJBCfVsLc", // ID YouTube 
      poster: "https://img.youtube.com/vi/i-WJBCfVsLc/maxresdefault.jpg",
      title: "Testimoni 4",
      description:
        "Bukan Sekadar Video,Tapi Pengalaman yang Nempel di Hati!",
      duration: "00:05",
      
    },
    {
      id: 4,
      src: "XRA2zZBmBG0", // ID YouTube 
      poster: "https://img.youtube.com/vi/XRA2zZBmBG0/maxresdefault.jpg",
      title: "Testimoni 3",
      description:
        "Bukan Sekadar Video,Tapi Pengalaman yang Nempel di Hati!",
      duration: "00:05",
      
    },
  ];

  const openImageModal = (src: string) => {
    setSelectedImage(src);
  };

  const openVideoModal = (src: string) => {
    setSelectedVideo(src);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
  };

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                Epicmo Gallery
              </h1>
              <p className="text-gray-600 text-lg">
                Jelajahi koleksi foto dan video menarik kami
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                className={`py-3 px-6 font-medium text-sm transition-all duration-300 ${
                  activeTab === "photos"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 rounded-t-lg"
                    : "text-gray-500 hover:text-blue-500"
                }`}
                onClick={() => setActiveTab("photos")}
              >
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Photos ({photos.length})
                </span>
              </button>
              <button
                className={`py-3 px-6 font-medium text-sm transition-all duration-300 ${
                  activeTab === "videos"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 rounded-t-lg"
                    : "text-gray-500 hover:text-blue-500"
                }`}
                onClick={() => setActiveTab("videos")}
              >
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Videos ({videos.length})
                </span>
              </button>
            </div>

            {/* Content based on active tab */}
            <div className="transition-opacity duration-300">
              {activeTab === "photos" && (
                <div className="animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Photo Collection
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                        onMouseEnter={() => setHoveredItem(`photo-${photo.id}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => openImageModal(photo.src)}
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={photo.src}
                            alt={photo.title}
                            className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div
                            className={`absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 ${
                              hoveredItem === `photo-${photo.id}`
                                ? "opacity-100"
                                : "opacity-0"
                            }`}
                          >
                            <button className="bg-white text-blue-600 rounded-full p-2 shadow-lg transform hover:scale-110 transition-transform duration-300">
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3-3H7"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-2 truncate">
                            {photo.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {photo.description}
                          </p>
                          
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "videos" && (
                <div className="animate-fadeIn">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <svg
                      className="w-6 h-6 mr-2 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Video Collection
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
                        onMouseEnter={() => setHoveredItem(`video-${video.id}`)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => openVideoModal(video.src)}
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={video.poster}
                            alt={video.title}
                            className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className={`w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-300 ${
                                hoveredItem === `video-${video.id}`
                                  ? "scale-110 bg-blue-500"
                                  : ""
                              }`}
                            >
                              <svg
                                className={`w-8 h-8 transition-all duration-300 ${
                                  hoveredItem === `video-${video.id}`
                                    ? "text-white"
                                    : "text-blue-600"
                                }`}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-800 mb-2 truncate">
                            {video.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {video.description}
                          </p>
                          
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Section */}
            <div className="mt-12 p-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Gallery Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {photos.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Photos</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {videos.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Videos</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {photos.length + videos.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Media</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">28</div>
                  <div className="text-sm text-gray-600">Views This Week</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal untuk gambar yang diperbesar */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="max-w-4xl max-h-full">
              <div className="relative">
                <button
                  className="absolute -top-12 right-0 text-white text-3xl z-10 hover:text-gray-300 transition-colors"
                  onClick={closeModal}
                >
                  &times;
                </button>
                <img
                  src={selectedImage}
                  alt="Zoomed"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal untuk video */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="max-w-4xl w-full">
              <div className="relative">
                <button
                  className="absolute -top-12 right-0 text-white text-3xl z-10 hover:text-gray-300 transition-colors"
                  onClick={closeModal}
                >
                  &times;
                </button>
                <div className="relative pt-[56.25%]"> {/* 16:9 Aspect Ratio */}
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube video player"
                  ></iframe>
                </div>
              </div>
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