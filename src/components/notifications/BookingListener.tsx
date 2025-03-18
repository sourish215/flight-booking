"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { toast } from "sonner";
import { createSupabaseClient } from "@/lib/supabase/client";

export default function BookingListener() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    console.log("Setting up booking listener for user:", user.id);
    const supabase = createSupabaseClient();

    // Subscribe to booking updates for this user
    const channel = supabase
      .channel("booking-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("🔔 Booking update received:", payload);

          // Only show notification if status is confirmed
          if (payload.new.status === "confirmed") {
            console.log(
              "🎉 Showing confirmation toast for booking:",
              payload.new.id
            );

            // Show a toast notification with Sonner
            toast("Booking Confirmed!", {
              description: "Your booking has been confirmed",
              action: {
                label: "View",
                onClick: () => router.push(`/bookings/${payload.new.id}`),
              },
              duration: 10000,
            });

            // Refresh the bookings page if we're on it
            if (window.location.pathname.includes("/bookings")) {
              // Force a page reload
              window.location.reload();
            }
          } else {
            console.log(
              "📝 Booking updated but status is not confirmed:",
              payload.new.status
            );
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, router]);

  return null;
}
