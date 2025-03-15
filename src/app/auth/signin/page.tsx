"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { createSupabaseClient } from "@/lib/supabase/client";

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 animate-pulse">
        <div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn(email, password);

      // Add a delay to ensure session is properly set
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify session was created
      const supabase = createSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        console.error("Session not established after sign-in");
        throw new Error("Failed to establish session. Please try again.");
      }

      // Check if we need to complete profile first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        // PGRST116 means no rows
        console.error("Error fetching profile:", profileError);
        throw new Error("Failed to fetch user profile");
      }

      // Check if profile needs to be completed
      if (!profile?.full_name) {
        // Redirect to complete profile if not done yet
        const profileRedirect = `/auth/complete-profile?redirect=${encodeURIComponent(
          redirectTo
        )}`;
        router.replace(profileRedirect);
        return;
      }

      // Handle the redirect
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      console.error("Sign in error:", err);
      if (err instanceof Error) {
        if (err.message.includes("Email not confirmed")) {
          setError(
            "Please verify your email address before signing in. " +
              "Check your email for a verification link."
          );
        } else if (err.message.includes("Invalid login credentials")) {
          setError("Invalid email or password");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold ">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm">
            Or{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
