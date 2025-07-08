import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-8 px-4 shadow-md">
      <div className="mb-8 text-2xl font-bold text-blue-600 text-center">
        Epicmo
      </div>
      <nav className="flex flex-col gap-4">
        <Link
          href="/"
          className="px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          Home
        </Link>
        <Link
          href="/user"
          className="px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          User
        </Link>
        <Link
          href="/login"
          className="px-4 py-2 rounded hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors font-medium"
        >
          Login
        </Link>
        {/* Tambahkan menu lain di sini */}
      </nav>
      <div className="mt-auto text-xs text-gray-400 text-center pt-8">
        © {new Date().getFullYear()} Epicmo
      </div>
    </aside>
  );
}
