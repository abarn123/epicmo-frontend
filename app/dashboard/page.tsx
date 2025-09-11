"use client";
import React, { useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

const MediaDashboard = () => {
  const [activeTab, setActiveTab] = useState('photos');
  
  // Data contoh untuk foto
  const photos = [
    {
      id: 1,
      src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      title: "Pegunungan Indah",
      description: "Pemandangan pegunungan yang menakjubkan dengan udara segar dan pemandangan memukau."
    },
    {
      id: 2,
      src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b",
      title: "Pantai yang Tenang",
      description: "Ombak yang berkejaran dengan pasir putih, menciptakan harmoni alam yang menenangkan."
    },
    {
      id: 3,
      src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
      title: "Hutan Hijau",
      description: "Kehijauan hutan yang menyegarkan mata, dengan beragam kehidupan di dalamnya."
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
      title: "Danau yang Jernih",
      description: "Air danau yang jernih memantulkan keindahan langit dan pepohonan di sekitarnya."
    }
  ];

  // Data contoh untuk video
  const videos = [
    {
      id: 1,
      poster: "https://images.unsplash.com/photo-1559703248-dcaaec9fab78",
      title: "Petualangan Seru",
      description: "Video petualangan mendaki gunung dengan pemandangan memukau sepanjang perjalanan."
    },
    {
      id: 2,
      poster: "https://images.unsplash.com/photo-1579801025761-8cfc1b06bfed",
      title: "Kehidupan Bawah Laut",
      description: "Eksplorasi keindahan terumbu karang dan kehidupan bawah laut yang penuh warna."
    },
    {
      id: 3,
      poster: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
      title: "Pemandangan Kota",
      description: "Time-lapse pergerakan kota dari siang hingga malam dengan lampu-lampu indah."
    },
    {
      id: 4,
      poster: "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1",
      title: "Sunset di Pantai",
      description: "Momen indah matahari terbenam di garis horizon lautan."
    }
  ];

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Epicmo Gallery</h1>
            <p className="text-gray-600 mb-8">Jelajahi koleksi foto dan video menarik kami</p>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-8">
              <button
                className={`py-3 px-6 font-medium text-sm ${activeTab === 'photos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('photos')}
              >
                Photos
              </button>
              <button
                className={`py-3 px-6 font-medium text-sm ${activeTab === 'videos' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('videos')}
              >
                Videos
              </button>
            </div>
            
            {/* Content based on active tab */}
            {activeTab === 'photos' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Photo Collection</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {photos.map(photo => (
                    <div key={photo.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                      <div className="relative">
                        <img 
                          src={photo.src} 
                          alt={photo.title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">{photo.title}</h3>
                        <p className="text-gray-600 text-sm">{photo.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'videos' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Video Collection</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {videos.map(video => (
                    <div key={video.id} className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
                      <div className="relative">
                        <img 
                          src={video.poster} 
                          alt={video.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">{video.title}</h3>
                        <p className="text-gray-600 text-sm">{video.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Stats Section */}
          
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
};

export default MediaDashboard;