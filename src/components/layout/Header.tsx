"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const { user, signOut, session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    console.log("Starting sign-out process...");

    try {
      // Add a timeout to prevent hanging
      const signOutPromise = signOut();
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log("Sign-out timed out, continuing with redirect");
          resolve();
        }, 3000);
      });

      // Race between the signOut function and our timeout
      await Promise.race([signOutPromise, timeoutPromise]);

      console.log("Sign-out process finished, redirecting...");
    } catch (err) {
      console.error("Sign-out error:", err);
    } finally {
      // Always redirect, even if there were errors
      console.log("Executing redirect to home page");

      // First try router navigation
      try {
        router.push("/");
        router.refresh();
      } catch (e) {
        console.warn("Router navigation failed:", e);
      }

      // As a fallback, also use direct navigation with a timeout
      // This ensures we eventually navigate even if router methods fail
      setTimeout(() => {
        console.log("Executing fallback navigation");
        window.location.href = "/?logout=" + Date.now();
      }, 500);
    }
  };

  // Close mobile menu when clicking any link
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            FlightBooker
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {session && (
              <Link
                href="/bookings"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                My Bookings
              </Link>
            )}
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors">
                    <span>{user.email}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 group-hover:rotate-180 transition-transform duration-200"
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
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-in-out z-50">
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
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden ${
            mobileMenuOpen ? "block" : "hidden"
          } mt-4 py-2 border-t border-gray-200`}
        >
          {session && (
            <Link
              href="/bookings"
              onClick={closeMobileMenu}
              className="block py-2 px-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              My Bookings
            </Link>
          )}
          {session ? (
            <>
              <div className="py-2 px-2 text-gray-600 font-medium border-b border-gray-100">
                {user.email}
              </div>
              <Link
                href="/profile"
                onClick={closeMobileMenu}
                className="block py-2 px-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  closeMobileMenu();
                  handleSignOut();
                }}
                className="block w-full text-left py-2 px-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 p-2">
              <Link
                href="/auth/signin"
                onClick={closeMobileMenu}
                className="block py-2 text-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                onClick={closeMobileMenu}
                className="block py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
