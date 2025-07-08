import React from "react";
import Link from "next/link";
import Sidebar from "../components/Sidebar";

const tools = [
  {
    name: "Box Epicmo",
    description: "Compress and optimize your images for faster loading.",
    image: "/tools/image-optimizer.jpg",
    stock: 4,
  },
  {
    name: "Tripod box",
    description: "Write and preview markdown documents in real-time.",
    image: "/tools/markdown-editor.jpg",
    stock: 8,
  },
  {
    name: "mini pc",
    description: "Create beautiful color palettes for your projects.",
    image: "/tools/color-palette.jpg",
    stock: 5,
  },
  {
    name: "monitor",
    description: "Format and validate your JSON data easily.",
    image: "/tools/json-formatter.jpg",
    stock: 20,
  },
];

export default function ToolsPage() {
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
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="relative bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 flex flex-col items-center border border-indigo-100 hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute top-4 right-4 bg-indigo-50 px-3 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow">
                  Stock: <span className="font-bold">{tool.stock}</span>
                </div>
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="w-28 h-28 object-cover rounded-xl mb-6 border-4 border-indigo-100 shadow-md"
                />
                <h2 className="text-2xl font-bold text-indigo-800 mb-2 text-center">
                  {tool.name}
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  {tool.description}
                </p>
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
