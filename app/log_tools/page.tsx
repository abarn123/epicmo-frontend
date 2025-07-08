import { Search, ScanBarcode, CalendarDays, Clock, UserRound, PackageCheck } from "lucide-react";
import Link from "next/link";

export default function log_tools() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Form Peminjaman Barang</h1>
          <p className="mt-2 text-gray-600">Isi form berikut untuk meminjam barang</p>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 sm:p-8">
          {/* Pencarian Barang */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Barang</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ketik nama atau scan barcode barang"
              />
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <ScanBarcode className="h-5 w-5 text-blue-600" />
              </button>
            </div>
          </div>

          {/* Informasi Barang */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <PackageCheck className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="font-medium text-gray-800">Informasi Barang</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nama Barang</p>
                <p className="font-medium">-</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kode Barang</p>
                <p className="font-medium">-</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Kategori</p>
                <p className="font-medium">-</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Stok Tersedia</p>
                <p className="font-medium">-</p>
              </div>
            </div>
          </div>

          {/* Form Peminjaman */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peminjam</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nama peminjam"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pinjam</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDays className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kembali</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDays className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Keperluan</label>
              <textarea
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tujuan peminjaman barang"
              ></textarea>
            </div>

            <div className="flex items-center">
              <input
                id="terms-checkbox"
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms-checkbox" className="ml-2 text-sm text-gray-600">
                Saya bertanggung jawab penuh atas barang yang dipinjam
              </label>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="mt-8 flex flex-col sm:flex-row sm:justify-end gap-3">
            <Link 
              href="/"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-center hover:bg-gray-50 transition"
            >
              Batal
            </Link>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition"
            >
              Ajukan Peminjaman
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
