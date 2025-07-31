"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

type User = {
  id: string;
  name: string;
  phone: string;
  address: string;
  role: string;
};

export default function EditUserPage() {
  const params = useSearchParams();
  const userId = params.get("id");
  const { token } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = () => {
    console.log("fetchUserData called");
    console.log("userId:", userId);
    if (!userId) {
      setError("ID pengguna tidak ditemukan");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    axios
      .get(`http://192.168.110.100:8080/data1/${userId}`, {
        timeout: 5000,
      })
      .then((res) => {
        console.log("User data fetched:", res.data);
        console.log("Full response:", JSON.stringify(res.data, null, 2));
        console.log("Response structure:", {
          id: res.data.data?.id,
          name: res.data.data?.name,
          phone: res.data.data?.phone,
          address: res.data.data?.address,
          role: res.data.data?.role
        });
        // Data berada di dalam property 'data'
        setUser(res.data.data || res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          toast.error("Pengguna tidak ditemukan");
          setError("Pengguna tidak ditemukan");
        } else if (axios.isAxiosError(err) && err.response?.status === 500) {
          toast.error("Server error. Silakan coba lagi.");
          setError("Server error. Silakan coba lagi.");
        } else if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
          toast.error("Request timeout. Silakan coba lagi.");
          setError("Request timeout. Silakan coba lagi.");
        } else {
          toast.error("Gagal mengambil data pengguna");
          setError("Gagal mengambil data pengguna");
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Debug: Log user data when it changes
  useEffect(() => {
    if (user) {
      console.log("User data loaded:", user);
      console.log("Name:", user.name);
      console.log("Phone:", user.phone);
      console.log("Address:", user.address);
      console.log("Role:", user.role);
      console.log("Full user object:", JSON.stringify(user, null, 2));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUser((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await axios.put(
        `http://192.168.110.100:8080/data1/edit/${user.id}`,
        user
      );
      toast.success("Pengguna berhasil diperbarui");
      // Redirect back to user list
      window.location.href = "/user";
    } catch (err) {
      console.error("Error updating user:", err);
      toast.error("Gagal memperbarui pengguna");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <div className="text-gray-600">Memuat data pengguna...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Terjadi Kesalahan
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchUserData}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition shadow-md"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center">
          <button
            onClick={() => window.history.back()}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Edit User</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Form Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <h2 className="text-lg font-semibold text-gray-800">
              User Information
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Update the user information below
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            <div className="px-6 py-6 space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={user.name || ""}
                    onChange={handleChange}
                    required
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-800"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={user.phone || ""}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-800"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Address Field */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Address
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={user.address || ""}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 transition duration-150 ease-in-out sm:text-sm bg-white text-gray-800"
                    placeholder="Enter address"
                  />
                </div>
              </div>

              {/* Role Field */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  value={user.role || ""}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm sm:text-sm text-black"
                >
                  <option value="admin">Admin</option>
                  <option value="Staff">Staff</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 bg-gray-50 text-right">
              <div className="flex justify-end space-x-3">
                <Link
                  href="/user"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
