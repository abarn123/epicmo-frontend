import { Camera, User, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Attendance() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-50 mb-4">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Verifikasi Kehadiran</h1>
            <p className="mt-2 text-gray-600">Silahkan hadapkan wajah Anda ke kamera untuk proses identifikasi</p>
          </div>

          {/* Camera Area */}
          <div className="relative bg-gray-100 rounded-xl overflow-hidden h-80 flex flex-col items-center justify-center mb-6">
            <div className="text-center p-4">
              <Camera className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Kamera siap digunakan</p>
            </div>
            
            {/* Face Guide Overlay */}
            <div className="absolute inset-0 border-4 border-dashed border-blue-300/50 rounded-xl m-4 pointer-events-none flex items-center justify-center">
              <div className="w-40 h-48 border-2 border-blue-400 rounded-lg"></div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg flex items-center">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin mr-2" />
            <span className="text-blue-700">Sedang memproses: Menunggu verifikasi wajah...</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3">
            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm">
              <Camera className="h-5 w-5" />
              Ambil Foto
            </button>
            
            <button className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
              Verifikasi Wajah
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 max-w-2xl w-full bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">Tips Verifikasi Optimal</h3>
            <div className="mt-1 text-sm text-gray-600 space-y-1">
              <p>• Pastikan wajah berada dalam area panduan</p>
              <p>• Cahaya cukup dan tidak silau</p>
              <p>• Hindari penggunaan aksesori yang menutupi wajah</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}