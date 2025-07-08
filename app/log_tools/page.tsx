import {
  Search,
  ScanBarcode,
  CalendarDays,
  UserRound,
  PackageCheck,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

export default function LogTools() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Sidebar />
      <main className="flex-1 py-14 px-6 ml-64">
        <section className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-extrabold text-indigo-800 mb-3 text-center drop-shadow-lg tracking-tight">
            📝 Borrowing Form
          </h1>
          <p className="text-xl text-gray-700 mb-6 text-center">
            Complete the form for a smooth borrowing process
          </p>

          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-indigo-100">
            {/* Item Search */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-indigo-700 mb-2">
                Search Item
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-indigo-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-12 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/50 shadow-sm"
                  placeholder="Type item name or scan barcode"
                />
                <button className="absolute inset-y-0 right-0 px-4 flex items-center bg-indigo-100 rounded-r-xl hover:bg-indigo-200 transition-colors">
                  <ScanBarcode className="h-5 w-5 text-indigo-600" />
                </button>
              </div>
            </div>

            {/* Item Information */}
            <div className="border-2 border-indigo-100 rounded-xl p-5 mb-8 bg-indigo-50/30 shadow-inner">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg mr-3 shadow-sm">
                  <PackageCheck className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg text-indigo-800">Item Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Item Name", value: "-" },
                  { label: "Item Code", value: "-" },
                  { label: "Category", value: "-" },
                  { label: "Available Stock", value: "-" }
                ].map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-indigo-50">
                    <p className="text-xs font-medium text-indigo-500 uppercase tracking-wider">{item.label}</p>
                    <p className="font-medium text-gray-700 mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Borrowing Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">
                  Borrower
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserRound className="h-5 w-5 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/30 shadow-sm"
                    placeholder="Full name of borrower"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-indigo-700 mb-2">
                    Borrow Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarDays className="h-5 w-5 text-indigo-400" />
                    </div>
                    <input
                      type="date"
                      className="block w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/30 shadow-sm appearance-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-indigo-700 mb-2">
                    Return Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarDays className="h-5 w-5 text-indigo-400" />
                    </div>
                    <input
                      type="date"
                      className="block w-full pl-10 pr-3 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/30 shadow-sm appearance-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-indigo-700 mb-2">
                  Purpose of Borrowing
                </label>
                <textarea
                  rows={3}
                  className="block w-full px-4 py-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-50/30 shadow-sm"
                  placeholder="Explain the purpose of borrowing this item"
                ></textarea>
              </div>

              <div className="flex items-start mt-6">
                <div className="flex items-center h-5">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-indigo-300 rounded focus:ring-indigo-500"
                  />
                </div>
                <label
                  htmlFor="terms-checkbox"
                  className="ml-3 text-sm text-gray-600"
                >
                  I agree to take full responsibility for the borrowed item during the borrowing period
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row sm:justify-end gap-4">
              <Link
                href="/tools"
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 text-center hover:bg-gray-50 transition-colors font-medium shadow-sm"
              >
                Cancel
              </Link>
              <button
                type="button"
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all"
              >
                Submit Borrow Request
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}