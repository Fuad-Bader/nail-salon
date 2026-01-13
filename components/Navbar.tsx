"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-pink-600 dark:text-pink-400"
            >
              Cute Tips💅
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/services"
              className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium"
            >
              Services
            </Link>

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/booking"
                  className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Book Now
                </Link>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/account"
                  className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Account
                </Link>
                <ThemeToggle />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-pink-600 dark:bg-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-700 dark:hover:bg-pink-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-pink-600 dark:bg-pink-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-700 dark:hover:bg-pink-800"
                >
                  Sign Up
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
