"use client"; // Tambahkan ini di baris paling atas

import { useEffect, useRef, useState } from "react";
import { Camera, User, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

// ... kode selanjutnya tetap sama ...
export default function Attendance() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);

  useEffect(() => {
    // Initialize camera when component mounts
    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // Use front camera
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraLoading(false);
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
        setIsCameraLoading(false);
      }
    };

    initCamera();

    // Clean up function to stop camera when component unmounts
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const photoUrl = canvas.toDataURL('image/png');
        setPhotoData(photoUrl);
        setPhotoTaken(true);
      }
    }
  };

  const retakePhoto = () => {
    setPhotoTaken(false);
    setPhotoData(null);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Sidebar />
      <main className="flex-1 py-14 px-6 ml-64">
        <section className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-50 mb-4 shadow-inner">
              <User className="h-7 w-7 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-extrabold text-indigo-800 mb-3 text-center drop-shadow-lg tracking-tight">
              👤 Face Verification
            </h1>
            <p className="text-xl text-gray-700 mb-6 text-center">
              Please position your face in front of the camera for identification
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-indigo-100">
            {/* Camera Area */}
            <div className="relative bg-indigo-50 rounded-xl overflow-hidden h-96 flex flex-col items-center justify-center mb-6">
              {isCameraLoading ? (
                <div className="text-center p-4">
                  <Loader2 className="mx-auto h-14 w-14 text-indigo-300 mb-3 animate-spin" />
                  <p className="text-indigo-500">Initializing camera...</p>
                </div>
              ) : error ? (
                <div className="text-center p-4">
                  <Camera className="mx-auto h-14 w-14 text-indigo-300 mb-3" />
                  <p className="text-red-500">{error}</p>
                </div>
              ) : photoTaken ? (
                <div className="relative w-full h-full">
                  <img 
                    src={photoData || ''} 
                    alt="Captured" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-dashed border-indigo-300/50 rounded-xl m-4 pointer-events-none flex items-center justify-center">
                    <div className="w-44 h-56 border-2 border-indigo-400 rounded-lg"></div>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-dashed border-indigo-300/50 rounded-xl m-4 pointer-events-none flex items-center justify-center">
                    <div className="w-44 h-56 border-2 border-indigo-400 rounded-lg"></div>
                  </div>
                </>
              )}
            </div>

            {/* Status Indicator */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-lg flex items-center shadow-inner">
              <Loader2 className="h-5 w-5 text-indigo-600 animate-spin mr-3" />
              <span className="text-indigo-700 font-medium">
                {photoTaken ? "Photo captured. Ready for verification" : "Processing: Waiting for face verification..."}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-4">
              {photoTaken ? (
                <>
                  <button 
                    onClick={retakePhoto}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Retake Photo
                  </button>
                  <button 
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Verify Face
                  </button>
                </>
              ) : (
                <button 
                  onClick={capturePhoto}
                  disabled={isCameraLoading || !!error}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera className="h-5 w-5" />
                  Capture Photo
                </button>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-5 border border-indigo-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1 bg-indigo-100 rounded-lg">
                <svg
                  className="h-5 w-5 text-indigo-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-indigo-800">
                  Optimal Verification Tips
                </h3>
                <div className="mt-2 text-gray-600 space-y-2">
                  <p className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    Ensure your face is within the guide area
                  </p>
                  <p className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    Good lighting without glare
                  </p>
                  <p className="flex items-start">
                    <span className="text-indigo-500 mr-2">•</span>
                    Avoid accessories that cover your face
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}