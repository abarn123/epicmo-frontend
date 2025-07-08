import React from "react";
import Sidebar from "../components/Sidebar";

const tools = [
  {
    name: "Image Optimizer",
    description: "Compress and optimize your images for faster loading.",
    icon: "🖼️",
  },
  {
    name: "Markdown Editor",
    description: "Write and preview markdown documents in real-time.",
    icon: "📝",
  },
  {
    name: "Color Palette Generator",
    description: "Create beautiful color palettes for your projects.",
    icon: "🎨",
  },
  {
    name: "JSON Formatter",
    description: "Format and validate your JSON data easily.",
    icon: "🔧",
  },
];

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gradient-to-br from-gray-50 to-blue-100 py-12 px-4">
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
                <div className="text-5xl mb-4">{tool.icon}</div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {tool.name}
                </h2>
                <p className="text-gray-500 text-center">{tool.description}</p>
                <button className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
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
