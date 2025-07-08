import React from "react";
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-blue-100 py-12 px-4 ml-64">
        <section className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 text-center">
            🚀 Tools Dashboard
          </h1>
          <p className="text-lg text-gray-600 mb-10 text-center">
            Explore a suite of professional tools to boost your productivity.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition-shadow"
              >
                <img
                  src={tool.image}
                  alt={tool.name}
                  className="w-28 h-28 object-cover rounded-lg mb-4 border border-gray-200 shadow"
                />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {tool.name}
                </h2>
                <p className="text-gray-500 text-center mb-2">
                  {tool.description}
                </p>
                <div className="text-sm text-gray-600 mb-4">
                  Stok:{" "}
                  <span className="font-bold text-indigo-700">
                    {tool.stock}
                  </span>
                </div>
                <button className="mt-auto px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
