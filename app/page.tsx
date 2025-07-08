import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <header className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <Image
            src="/epicmo.logo.png"
            alt="Next.js Logo"
            width={190}
            height={190}
            className="dark:invert"
          />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="max-w-xl text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-gray-900 dark:text-white">
            <span className="text-blue-600">Epicmo</span> Photobooth
          </h1>
          <h4 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-300">
            Abadikan Setiap Momen Spesial Bersama{" "}
            <span className="text-blue-600">EPICMO Photobooth</span>
          </h4>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Ubah acara spesial Anda menjadi kenangan tak terlupakan dengan
            photobooth interaktif dari EPICMO. Cocok untuk pernikahan, acara
            perusahaan, dan momen berharga lainnya!
          </p>
          <Link
            href="/login"
            className="group inline-block px-8 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white rounded-full font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 relative overflow-hidden"
          >
            <span className="absolute inset-0 w-full h-full bg-blue-800 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-full"></span>
            <span className="relative z-10 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-white opacity-80 group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
              Login
            </span>
          </Link>
        </div>
      </main>
      <footer className="py-6 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between px-8 gap-4 text-sm text-gray-500 dark:text-gray-400">
        <span>© {new Date().getFullYear()} Epicmo. All rights reserved.</span>
        <div className="flex gap-4">
          <a
            href="https://www.instagram.com/epicmo.photobooth/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            epicmo.photobooth
          </a>
        </div>
      </footer>
    </div>
  );
}
