import { Camera } from "lucide-react";
import Link from "next/link";

export default function attendance(){
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Absensi Wajah</h1>
            <p className="mt-2 text-gray-600">Silahkan hadapkan wajah Anda ke kamera</p>
          </div>

          {/* Area Kamera */}
          <div className="relative bg-gray-200 rounded-lg overflow-hidden h-64 flex items-center justify-center mb-6">
            <div className="text-center">
              <Camera className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">Kamera sedang aktif</p>
            </div>
            
            {/* Overlay untuk panduan wajah */}
            <div className="absolute inset-0 border-4 border-dashed border-blue-400 rounded-lg m-4 pointer-events-none"></div>
          </div>

          {/* Tombol Aksi */}
          <div className="flex flex-col space-y-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
              Ambil Foto
            </button>
            
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200">
              Verifikasi Wajah
            </button>

            <Link href="/dashboard" className="block text-center text-blue-500 hover:text-blue-700 text-sm mt-4">
              Kembali ke Dashboard
            </Link>
          </div>

          {/* Status */}
          <div className="mt-6 p-3 bg-yellow-50 rounded-lg text-center">
            <p className="text-yellow-700 text-sm">Status: Menunggu verifikasi wajah...</p>
          </div>
        </div>
      </div>

      {/* Catatan */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Pastikan wajah terlihat jelas dan pencahayaan cukup</p>
      </div>
    </div>
  );
}
