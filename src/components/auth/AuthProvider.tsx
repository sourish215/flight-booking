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
        } = supabase.auth.onAuthStateChange(async () => {
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error("Authentication failed. Please try again.");
    }

    // Explicitly set the session in state
    setSession(data.session);
    setUser(data.session.user);
  };

  const signUp = async (email: string, password: string) => {
    // Get the base URL based on environment
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

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
      if (error.message.includes("User already registered")) {
        throw new Error(
          "An account with this email already exists. " +
            "Please sign in or use a different email address."
        );
      }
      throw error;
    }

    if (!data.user) {
      throw new Error("Failed to create user account. Please try again.");
    }

    // Always throw a verification message
    // This ensures users know they need to verify their email
    throw new Error(
      "Please check your email for a verification link. " +
        "After verifying your email, you can sign in and complete your profile."
    );
  };

  const signOut = async () => {
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
            timeoutResolve();
          }, 2000);
        });

        // Race between the actual sign out and the timeout
        await Promise.race([signOutPromise, timeoutPromise]);

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
            });
          } catch (e) {
            console.warn("Error clearing localStorage:", e);
          }
        }

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
