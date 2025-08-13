"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
  const { userName, userId, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Memuat profil...</div>
      </div>
    );
  }

  if (!userName && !userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Data user tidak ditemukan.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center">
        <img
          src="/user-photo.png"
          alt={userName ? `Foto ${userName}` : "User Photo"}
          className="w-24 h-24 rounded-full object-cover border border-gray-300 mb-4"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(userName || "User") +
              "&background=0D8ABC&color=fff&size=128";
          }}
        />
        <h2 className="text-2xl font-bold mb-2">{userName || "User"}</h2>
        <p className="text-gray-500 mb-4">User ID: {userId ?? "-"}</p>
        <button
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => router.push("/dashboard")}
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}
