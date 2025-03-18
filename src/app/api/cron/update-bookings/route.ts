import { NextResponse } from "next/server";
import { createDirectSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("⏱️ Running update-bookings cron job");
    const supabase = createDirectSupabaseClient();

    // Find pending bookings older than 45 seconds
    const timeThreshold = new Date();
    timeThreshold.setSeconds(timeThreshold.getSeconds() - 45);

    console.log(
      `⏱️ Looking for bookings older than ${timeThreshold.toISOString()}`
    );

    // Get pending bookings
    const { data: pendingBookings, error: fetchError } = await supabase
      .from("bookings")
      .select("id, user_id")
      .eq("status", "pending")
      .lt("booking_date", timeThreshold.toISOString());

    if (fetchError) {
      console.error("❌ Error fetching bookings:", fetchError);
      return NextResponse.json({ success: false, error: fetchError.message });
    }

    // No bookings to update
    if (!pendingBookings || pendingBookings.length === 0) {
      console.log("ℹ️ No pending bookings to update");
      return NextResponse.json({ success: true, updated: 0 });
    }

    console.log(
      `🔄 Found ${pendingBookings.length} pending bookings to update:`,
      pendingBookings
    );

    // Update and broadcast in a single operation for each booking
    for (const booking of pendingBookings) {
      console.log(
        `📡 Updating and broadcasting event for booking ${booking.id}, user ${booking.user_id}`
      );

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", booking.id);

      if (updateError) {
        console.error(`❌ Error updating booking ${booking.id}:`, updateError);
        continue;
      }
    }

    console.log(`✅ Successfully updated ${pendingBookings.length} bookings`);
    return NextResponse.json({
      success: true,
      updated: pendingBookings.length,
    });
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json({ success: false, error: "Unexpected error" });
  }
}
