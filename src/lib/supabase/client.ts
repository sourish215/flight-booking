import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database.types";

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const createSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  // Get domain for cookie settings
  const domain =
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "")
      : "localhost";

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key) => {
          if (typeof document !== "undefined") {
            return (
              document.cookie
                .split("; ")
                .find((row) => row.startsWith(`${key}=`))
                ?.split("=")[1] || null
            );
          }
          return null;
        },
        setItem: (key, value) => {
          if (typeof document !== "undefined") {
            document.cookie = `${key}=${value}; max-age=${
              60 * 60 * 24 * 7
            }; domain=${domain}; path=/; samesite=lax${
              process.env.NODE_ENV === "production" ? "; secure" : ""
            }`;
          }
        },
        removeItem: (key) => {
          if (typeof document !== "undefined") {
            document.cookie = `${key}=; max-age=0; domain=${domain}; path=/`;
          }
        },
      },
    },
  });
  return supabaseInstance;
};
