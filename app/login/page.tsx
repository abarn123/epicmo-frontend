"use client";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        name: formData.name,
        password: formData.password,
      });

      const data = response.data;

      if (response.status !== 200 || !data.status) {
        throw new Error(data.message || "Username atau password tidak sesuai");
      }

      // Pastikan role ada dan lowercase
      let role = data.role;
      if (!role && data.user && data.user.role) {
        role = data.user.role;
      }
      if (role) {
        role = role.toLowerCase();
        localStorage.setItem("role", role);
      } else {
        console.warn("Role tidak ditemukan di response login", data);
      }

      // Simpan nama user ke localStorage untuk fallback
      if (data.user && data.user.name) {
        localStorage.setItem("userName", data.user.name);
      }

      // Simpan username jika remember dicentang
      if (remember) {
        localStorage.setItem("rememberedUsername", formData.name);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      login(data.token, data.user?.id);

      // Setelah login(data.token);
const redirects: Record<string, string> = {
  freelance: "/attendance",
  staff: "/tools"
};

window.location.href = redirects[role] || "/user";



    } catch (err: any) {
      setError(err.response?.data?.message || "Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  const [remember, setRemember] = useState(false);
  React.useEffect(() => {
  const saved = localStorage.getItem("rememberedUsername");
  if (saved) {
    setFormData((prev) => ({ ...prev, name: saved }));
    setRemember(true);
  }
}, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-2xl w-full max-w-md border border-blue-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-50 h-50 flex items-center justify-center mb-2">
            <img
              src="/epicmo.logo.png"
              alt="User Avatar"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="name"
              className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-gray-900 placeholder-gray-400"
              placeholder="Username"
              required
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="block w-full px-4 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-gray-900 placeholder-gray-400"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
  id="remember"
  type="checkbox"
  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
  checked={remember}
  onChange={() => setRemember(!remember)}
/>
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-600"
              >
                Remember me
              </label>
            </div>
            
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
          <footer className="mt-8 text-center text-xs text-gray-400">
            &copy; 2025 Epicmo. All rights reserved.
          </footer>
        </form>
        
      </div>
    </div>
  );
}
