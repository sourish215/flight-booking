"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function Header() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const supabase = createSupabaseClient();

  const handleSignOut = async () => {
    try {
      console.log("Attempting to sign out...");

      await signOut();

      console.log("User signed out...");

      // Manually refresh session to ensure it's cleared
      await supabase.auth.refreshSession();

      // Redirect the user after successful sign-out
      router.replace("/");
      router.refresh();
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          FlightBooker
        </Link>

        <div className="flex items-center space-x-6">
          {/* <Link
            href="/flights/search"
            className="text-gray-600 hover:text-blue-600 transition-colors"
          >
            Search Flights
          </Link> */}
          {user && (
            <Link
              href="/bookings"
              className="text-gray-600 hover:text-blue-600 transition-colors"
            >
              My Bookings
            </Link>
          )}
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                  <span>{user.email}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
