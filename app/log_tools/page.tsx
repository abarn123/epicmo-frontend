"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProtectedRoute from "../components/ProtectedRoute";
import AuthenticatedLayout from "../components/AuthenticatedLayout";

// Placeholder for toast notifications
const toast = {
  success: (message: string) => console.log("Sukses:", message),
  error: (message: string) => console.error("Error:", message),
};

// Type definitions
type Tool = {
  id: string;
  item_name: string;
  stock: number;
  item_condition: string;
  category: string;
};

type BorrowRecord = {
  log_tools: string;
  transaction_id: string;
  user: string;
  user_id: string;
  tools_id: string;
  item_name: string;
  quantity: number;
  date_borrow: string;
  date_return: string | null;
  status: "pending" | "borrowed" | "return";
  reason?: string;
};

type GroupedBorrowRecord = {
  transaction_id: string;
  user: string;
  user_id: string;
  date_borrow: string;
  date_return: string | null;
  status: "pending" | "borrowed" | "return";
  reason?: string;
  items: {
    log_tools: string;
    tools_id: string;
    item_name: string;
    quantity: number;
  }[];
};

// Table Row Component for grouped records
function BorrowTableRow({
  record,
  refresh,
}: {
  record: GroupedBorrowRecord;
  refresh: () => void;
}) {
  const router = useRouter();
  const [showItems, setShowItems] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  // @ts-ignore
  const { role } = require("../context/AuthContext").useAuth();

  const handleApprove = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/data3/approve/${record.transaction_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Peminjaman disetujui");
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyetujui peminjaman");
    }
  };

  const handleReject = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/data3/reject/${record.transaction_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Peminjaman ditolak");
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menolak peminjaman");
    }
  };

  const handleReturn = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/data3/${record.transaction_id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Alat berhasil dikembalikan");
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengembalikan alat");
    }
  };

  const toggleShowItems = () => setShowItems(!showItems);

  const getStatusBadge = (status: string) => {
    if (status === "pending")
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
          Menunggu disetujui
        </span>
      );
    if (status === "borrowed")
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
          Dipinjam
        </span>
      );
    if (status === "return")
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
          Dikembalikan
        </span>
      );
    if (status === "rejected")
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
          Ditolak
        </span>
      );
    return <span>-</span>;
  };

  return (
    <>
      <tr className="border-b border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
        <td className="px-4 py-3 whitespace-nowrap">
          <button
            onClick={toggleShowItems}
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors"
          >
            <svg
              className={`w-4 h-4 mr-2 transform transition-transform ${
                showItems ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
            {record.items.length} alat
          </button>
        </td>
        <td className="px-4 py-3 whitespace-nowrap">{record.user}</td>
        <td className="px-4 py-3 whitespace-nowrap">
          {new Date(record.date_borrow).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          {record.date_return ? new Date(record.date_return).toLocaleDateString() : "-"}
        </td>
        <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(record.status)}</td>
        <td className="px-2 py-3 text-gray-700 text-xs leading-snug max-w-[100px] break-words">
          {record.reason || "-"}
        </td>
        <td className="px-4 py-3 text-right whitespace-nowrap">
          {record.status === "pending" && role === "admin" ? (
            <>
              <button
                onClick={handleApprove}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 mr-2"
              >
                Setujui
              </button>
              <button
                onClick={handleReject}
                className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                Tolak
              </button>
            </>
          ) : record.status === "borrowed" ? (
            <button
              onClick={handleReturn}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Kembalikan
            </button>
          ) : null}
        </td>
      </tr>
      {showItems &&
        record.items.map((item, i) => (
          <tr
            key={`${item.log_tools}-${i}`}
            className="border-b border-gray-100 bg-blue-50 hover:bg-blue-100"
          >
            <td className="px-8 py-2 text-gray-700" colSpan={7}>
              • {item.item_name} x{item.quantity}
            </td>
          </tr>
        ))}
    </>
  );
}

// Main Component
export default function ToolBorrowingSystem() {
  const [borrowRecords, setBorrowRecords] = useState<GroupedBorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/data3`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data || [];
      setBorrowRecords(data);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredRecords = borrowRecords.filter((r) =>
    r.user.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-t-2 border-blue-600 rounded-full"></div>
      </div>
    );

  return (
    <ProtectedRoute>
      <AuthenticatedLayout>
        <div className="bg-gray-50 min-h-screen py-8 px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">
                Sistem Peminjaman Alat
              </h1>
              <p className="text-gray-500">
                Kelola peminjaman dan pengembalian alat
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/tools"
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 flex items-center"
              >
                ← Kembali
              </Link>
              <Link
                href="/log_tools/add"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center"
              >
                + Pinjam Alat
              </Link>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari peminjam..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Alat
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Peminjam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal Pinjam
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tanggal Kembali
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Alasan
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record, i) => (
                  <BorrowTableRow
                    key={`${record.transaction_id}-${i}`}
                    record={record}
                    refresh={fetchData}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </AuthenticatedLayout>
    </ProtectedRoute>
  );
}
