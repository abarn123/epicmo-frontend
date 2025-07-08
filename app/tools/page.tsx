"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Sidebar from "../components/Sidebar";

// Tipe data untuk alat
interface Tool {
  tools: number;
  item_name: string;
  stock: number;
  item_condition: string;
  category: string;
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await axios.get("http://192.168.110.100:8080/data2"); // Ganti URL sesuai endpoint API tools Anda
        let toolsData = response.data;
        if (
          toolsData &&
          typeof toolsData === "object" &&
          !Array.isArray(toolsData)
        ) {
          if (Array.isArray(toolsData.data)) {
            toolsData = toolsData.data;
          } else if (Array.isArray(toolsData.tools)) {
            toolsData = toolsData.tools;
          }
        }
        if (!Array.isArray(toolsData))
          throw new Error("API did not return an array of tools");
        setTools(toolsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setTools([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTools();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <Sidebar />
        <main className="flex-1 py-14 px-6 ml-64 flex items-center justify-center">
          <div>Loading tools...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <Sidebar />
        <main className="flex-1 py-14 px-6 ml-64 flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <Sidebar />
      <main className="flex-1 py-14 px-6 ml-64">
        <section className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-extrabold text-indigo-800 mb-3 text-center drop-shadow-lg tracking-tight">
            🚀 Tools Dashboard
          </h1>
          <p className="text-xl text-gray-700 mb-6 text-center">
            Explore a suite of professional tools to boost your productivity.
          </p>
          <div className="flex justify-center mb-8">
            <div className="w-full flex justify-end">
              <Link
                href="/log_tools"
                className="inline-flex items-center gap-2 px-7 py-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-700 text-white rounded-full font-semibold shadow-lg hover:from-indigo-700 hover:to-blue-800 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <span className="material-icons text-lg">Log Tools</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {tools.map((tool, idx) => (
              <div
                key={tool.tools || idx}
                className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 flex flex-col items-center border border-indigo-100 hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute top-4 right-4 bg-indigo-50 px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow">
                  Stock: <span className="font-bold">{tool.stock}</span>
                </div>
                <h2 className="text-2xl font-bold text-indigo-800 mb-2 text-center">
                  {tool.item_name}
                </h2>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Kategori:</span>{" "}
                  {tool.category}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Kondisi:</span>{" "}
                  {tool.item_condition}
                </div>
              
                <button className="mt-auto px-6 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-lg font-semibold shadow hover:from-indigo-600 hover:to-blue-600 transition-all duration-200">
                  Open
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
