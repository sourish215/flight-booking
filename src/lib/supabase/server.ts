import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

// Updated for Next.js 14 with async cookies
export const createServerSupabaseClient = async () => {
  // For server components that need authentication, we'll still use the cookie-based approach
  // but we'll handle it properly for Next.js 14
  try {
    const cookieStore = cookies();
    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
    });
  } catch (error) {
    // If there's an error with the cookie-based approach, fall back to direct client
    console.warn(
      "Falling back to direct Supabase client due to cookie error:",
      error
    );
    return createDirectSupabaseClient();
  }
};

// Direct client for API routes and fallback for server components
export const createDirectSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};
