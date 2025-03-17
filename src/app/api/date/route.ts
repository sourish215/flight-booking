import { NextResponse } from "next/server";

/**
 * API route that returns the current date in ISO format
 * This ensures consistent date values between server and client
 */
export async function GET() {
  // Get the current date
  const now = new Date();

  // Format the date as YYYY-MM-DD for date inputs
  const formattedDate = now.toISOString().split("T")[0];

  // Get the current year
  const currentYear = now.getFullYear().toString();

  return NextResponse.json({
    date: formattedDate,
    year: currentYear,
    timestamp: now.toISOString(),
  });
}
