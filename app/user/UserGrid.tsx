import React from "react";

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
};

export default function UserGrid({ users, onEdit }: UserGridProps) {
  if (!users?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Tidak ada pengguna</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {users.map((user) => (
          <UserCard key={user.id} user={user} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

// Ekstrak komponen UserCard untuk keterbacaan lebih baik
function UserCard({ user, onEdit }: { user: User; onEdit?: (user: User) => void }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col space-y-3">
      <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
      <UserInfo label="No. Telepon" value={user.phone} />
      <UserInfo label="Alamat" value={user.address} />
      <UserInfo label="Role" value={user.role} className="text-indigo-600" />
      {onEdit && (
        <button
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
          onClick={() => onEdit(user)}
        >
          Edit
        </button>
      )}
    </div>
  );
}

// Komponen kecil untuk info pengguna
function UserInfo({ label, value, className = "" }: { 
  label: string; 
  value: string; 
  className?: string 
}) {
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className={`font-medium text-gray-700 ${className}`}>
        {value}
      </span>
    </div>
  );
}