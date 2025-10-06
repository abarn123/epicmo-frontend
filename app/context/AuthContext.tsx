"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  token: string | null;
  login: (token: string, id: number) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  userName: string | null;
  userId: number | null;
  userPhoto: string | null;
  role: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  // ambil token + userId dari localStorage pas app pertama kali load
  useEffect(() => {
  const storedToken = localStorage.getItem("token");
  const storedId = localStorage.getItem("userId");
  const storedRole = localStorage.getItem("role");

  if (storedToken) setToken(storedToken);
  if (storedId) setUserId(Number(storedId));
  if (storedRole) setRole(storedRole);

  setLoading(false);
  }, []);

  // fetch user detail kalau token dan userId ada
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token || !userId) {
        // fallback ke localStorage jika ada
        const fallbackName = localStorage.getItem("userName");
        setUserName(fallbackName ?? null);
        setUserPhoto(null);
        return;
      }
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          // fallback ke localStorage jika fetch gagal
          const fallbackName = localStorage.getItem("userName");
          setUserName(fallbackName ?? null);
          setUserPhoto(null);
          return;
        }
        const data = await res.json();

        setUserId(data.data?.id ?? null);
        if (data.data?.name) {
          setUserName(data.data.name);
          localStorage.setItem("userName", data.data.name);
        } else {
          // fallback ke localStorage jika tidak ada nama
          const fallbackName = localStorage.getItem("userName");
          setUserName(fallbackName ?? null);
        }
        setUserPhoto(data.data?.photo ?? null);
        if (data.data?.role) {
          setRole(data.data.role);
          localStorage.setItem("role", data.data.role);
        } else {
          setRole(null);
          localStorage.removeItem("role");
        }
      } catch (e) {
        console.error("Error fetching user:", e);
        // fallback ke localStorage jika error
        const fallbackName = localStorage.getItem("userName");
        setUserName(fallbackName ?? null);
        setUserId(null);
        setUserPhoto(null);
      }
    };
    fetchUserProfile();
  }, [token, userId]);

  // login nyimpen token + userId
  const login = (newToken: string, id: number, userRole?: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userId", id.toString());
    if (userRole) {
      localStorage.setItem("role", userRole);
      setRole(userRole);
    }
    setToken(newToken);
    setUserId(id);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    setToken(null);
    setUserName(null);
    setUserId(null);
    setUserPhoto(null);
    setRole(null);
    router.push("/login");
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        isAuthenticated,
        loading,
        userName,
        userId,
        userPhoto,
        role,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
