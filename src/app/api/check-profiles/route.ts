import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Try to query the profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (error) {
      return NextResponse.json(
        { error: "Error checking profiles table: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Profiles table exists and is accessible", data },
      { status: 200 }
    );
  } catch (err: Error | unknown) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to check profiles table",
      },
      { status: 500 }
    );
  }
}
