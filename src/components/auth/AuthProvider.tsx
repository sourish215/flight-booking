"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase/client";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        // Get current session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Set initial state
        setSession(session);
        setUser(session?.user ?? null);

        // Listen for auth changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
          console.log("Auth state changed:", { event: _event, session });

          // Always get fresh session on auth changes
          const {
            data: { session: freshSession },
          } = await supabase.auth.getSession();
          setSession(freshSession);
          setUser(freshSession?.user ?? null);
        });

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    console.log("Starting signup process...");

    // Get the base URL based on environment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    console.log("origin url", window.location.origin);

    // Sign up the user with email verification
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${baseUrl}/auth/complete-profile`,
        data: {
          email: email,
          signup_timestamp: new Date().toISOString(),
        },
      },
    });

    if (error) {
      console.error("Signup error:", error);
      if (error.message.includes("User already registered")) {
        throw new Error(
          "An account with this email already exists. " +
            "Please sign in or use a different email address."
        );
      }
      throw error;
    }

    if (!data.user) {
      console.error("No user data returned from signup");
      throw new Error("Failed to create user account. Please try again.");
    }

    console.log("User created:", data.user);

    // Always throw a verification message
    // This ensures users know they need to verify their email
    throw new Error(
      "Please check your email for a verification link. " +
        "After verifying your email, you can sign in and complete your profile."
    );
  };

  const signOut = async () => {
    console.log("Signing out...");

    // Clear local state immediately
    setUser(null);
    setSession(null);

    return new Promise<void>(async (resolve) => {
      try {
        // Try Supabase signOut but with a timeout to prevent hanging
        const signOutPromise = supabase.auth.signOut();

        // Create a timeout promise that resolves after 2 seconds
        const timeoutPromise = new Promise<void>((timeoutResolve) => {
          setTimeout(() => {
            console.log("Sign out timed out, continuing anyway");
            timeoutResolve();
          }, 2000);
        });

        // Race between the actual sign out and the timeout
        await Promise.race([
          signOutPromise.then(() => {
            console.log("Supabase sign out completed");
          }),
          timeoutPromise,
        ]);

        // Clear any Supabase-related items from localStorage
        if (typeof window !== "undefined") {
          try {
            // Find and remove all Supabase-related items
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.includes("supabase") || key.includes("sb-"))) {
                keysToRemove.push(key);
              }
            }

            // Remove items we found
            keysToRemove.forEach((key) => {
              localStorage.removeItem(key);
              console.log(`Removed localStorage item: ${key}`);
            });
          } catch (e) {
            console.warn("Error clearing localStorage:", e);
          }
        }

        console.log("Sign out process complete");
        resolve();
      } catch (err) {
        console.error("Sign out error:", err);
        // Resolve anyway to avoid hanging
        resolve();
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
