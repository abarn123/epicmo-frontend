"use client";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";

type User = {
  id: string;
  name: string;
  phone: string;
  address: string;
  role: string;
};

type UserGridProps = {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
  onAdd?: () => void;
};

function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}) {
  return (
    <div className="bg-white shadow-xl rounded-2xl p-6 flex flex-col space-y-4 border border-gray-100 hover:shadow-2xl transition">
      <div className="flex items-center space-x-4">
        <div className="bg-indigo-100 rounded-full h-12 w-12 flex items-center justify-center text-indigo-600 font-bold text-lg">
          {user.name[0]}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">{user.name}</h2>
          <span className="text-xs text-gray-400">{user.role}</span>
        </div>
      </div>
      <div className="text-sm text-gray-600">
        <div>
          <span className="font-semibold">No. Telepon:</span> {user.phone}
        </div>
        <div>
          <span className="font-semibold">Alamat:</span> {user.address}
        </div>
      </div>
      <div className="flex space-x-2 mt-2">
        {onEdit && (
          <button
            className="flex-1 px-3 py-1 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
            onClick={() => onEdit(user)}
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            className="flex-1 px-3 py-1 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition"
            onClick={() => onDelete(user.id)}
          >
            Hapus
          </button>
        )}
      </div>
    </div>
  );
}

export default function UserManagement({
  users = [], // default value agar tidak undefined
  onEdit,
  onDelete,
  onAdd,
}: UserGridProps) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search) ||
      u.address.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-indigo-800 mb-1">
              Manajemen User
            </h1>
            <p className="text-gray-500">
              Kelola data user aplikasi Anda dengan mudah.
            </p>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Cari user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
            />
            {onAdd && (
              <button
                className="px-5 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
                onClick={onAdd}
              >
                + Tambah User
              </button>
            )}
          </div>
        </div>
        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-lg">
              Tidak ada user ditemukan.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
