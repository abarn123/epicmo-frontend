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
  if (!users || users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">No users found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-white shadow-lg rounded-xl p-6 flex flex-col space-y-3"
          >
            <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
            <div>
              <span className="text-gray-500">No. Telepon: </span>
              <span className="font-medium text-gray-700">{user.phone}</span>
            </div>
            <div>
              <span className="text-gray-500">Alamat: </span>
              <span className="font-medium text-gray-700">{user.address}</span>
            </div>
            <div>
              <span className="text-gray-500">Role: </span>
              <span className="font-medium text-indigo-600">{user.role}</span>
            </div>
            {onEdit && (
              <button
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
                onClick={() => onEdit(user)}
              >
                Edit
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
