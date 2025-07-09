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
  loading?: boolean;
};

export default function UserGrid({ users, onEdit, loading }: UserGridProps) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Memuat data...</div>
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-lg">Tidak ada pengguna</div>
      </div>
    );
  }

  // Validate and filter users
  const validUsers = users.filter(user => {
    if (!user.id) {
      console.warn("User missing ID:", user);
      return false;
    }
    return true;
  });

  // Check for duplicate IDs
  const userIds = new Set();
  const hasDuplicateIds = validUsers.some(user => {
    if (userIds.has(user.id)) {
      console.error(`Duplicate user ID found: ${user.id}`);
      return true;
    }
    userIds.add(user.id);
    return false;
  });

  if (hasDuplicateIds) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-lg">Error: Duplicate user IDs detected</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {validUsers.map((user) => (
          <UserCard 
            key={`user-card-${user.id}`}
            user={user} 
            onEdit={onEdit} 
          />
        ))}
      </div>
    </div>
  );
}

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col space-y-3 hover:shadow-xl transition-shadow">
      <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
      <UserInfo label="No. Telepon" value={user.phone} />
      <UserInfo label="Alamat" value={user.address} />
      <UserInfo label="Role" value={user.role} className="text-indigo-600 font-semibold" />
      {onEdit && (
        <button
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition"
          onClick={() => onEdit(user)}
          aria-label={`Edit user ${user.name}`}
        >
          Edit
        </button>
      )}
    </div>
  );
}

interface UserInfoProps {
  label: string;
  value: string;
  className?: string;
}

function UserInfo({ label, value, className = "" }: UserInfoProps) {
  return (
    <div>
      <span className="text-gray-500 text-sm">{label}: </span>
      <span className={`font-medium text-gray-700 ${className}`}>
        {value || '-'}
      </span>
    </div>
  );
}

type UserManagementProps = {
  users: User[];
  onUserSelect?: (user: User) => void;
};

export function UserManagement({ users, onUserSelect }: UserManagementProps) {
  // Validate and filter users
  const validUsers = users.filter(user => {
    if (!user.id) {
      console.warn("User missing ID:", user);
      return false;
    }
    return true;
  });

  // Check for duplicate IDs
  const userIds = new Set();
  const hasDuplicateIds = validUsers.some(user => {
    if (userIds.has(user.id)) {
      console.error(`Duplicate user ID found: ${user.id}`);
      return true;
    }
    userIds.add(user.id);
    return false;
  });

  if (hasDuplicateIds) {
    return (
      <div className="p-4 text-red-500">
        Error: Duplicate user IDs detected in management list
      </div>
    );
  }

  return (
    <div className="user-management-container p-4">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {validUsers.length === 0 ? (
        <div className="text-gray-500">No valid users to display</div>
      ) : (
        <div className="space-y-4">
          {validUsers.map((user) => (
            <div 
              key={`management-user-${user.id}`}
              className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onUserSelect?.(user)}
            >
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-gray-600">{user.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}