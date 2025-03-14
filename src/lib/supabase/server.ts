import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/database.types";

// Simple and direct approach for Next.js 14
export const createServerSupabaseClient = async () => {
  return createServerComponentClient<Database>({ cookies });
};
