// src/components/flights/FlightList.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flight } from "@/types/database.types";
import {
  formatDuration,
  formatTime,
  formatCurrency,
} from "@/lib/utils/formatters";
import { useAuth } from "@/components/auth/AuthProvider";
import { createSupabaseClient } from "@/lib/supabase/client";

type FlightListProps = {
  flights: Flight[];
  type: "outbound" | "return";
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
};

export default function FlightList({
  flights,
  type,
  passengers,
}: FlightListProps) {
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [processingFlightId, setProcessingFlightId] = useState<string | null>(
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize component after auth loading is complete
  useEffect(() => {
    if (!authLoading) {
      setIsInitialized(true);
    }
  }, [authLoading]);

  // Setup IndexedDB for offline caching
  useEffect(() => {
    if (typeof window !== "undefined" && flights.length > 0) {
      const request = indexedDB.open("flightBookingDB", 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("flights")) {
          db.createObjectStore("flights", { keyPath: "id" });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction("flights", "readwrite");
        const store = tx.objectStore("flights");

        // Cache all flights
        flights.forEach((flight) => {
          store.put({
            ...flight,
            cached_at: new Date().toISOString(),
            search_type: type,
          });
        });
      };
    }
  }, [flights, type]);

  const handleSelectFlight = (flightId: string) => {
    setSelectedFlight(flightId);
  };

  const handleBookFlight = async (flightId: string, e: React.MouseEvent) => {
    // Stop event propagation to prevent triggering parent's onClick
    e.stopPropagation();

    // Don't proceed if component is not initialized or already processing
    if (!isInitialized || processingFlightId === flightId || isRedirecting) {
      return;
    }

    setProcessingFlightId(flightId);
    setIsRedirecting(true);

    try {
      const supabase = createSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Create booking parameters with current search params
      const currentUrl = new URL(window.location.href);
      const bookingParams = new URLSearchParams({
        flightId,
        passengers: JSON.stringify(passengers),
        origin: currentUrl.searchParams.get("origin") || "",
        destination: currentUrl.searchParams.get("destination") || "",
        departureDate: currentUrl.searchParams.get("departureDate") || "",
        cabinClass: currentUrl.searchParams.get("cabinClass") || "",
        tripType: currentUrl.searchParams.get("tripType") || "",
      });

      // Create the booking URL
      const bookingUrl = `/bookings/new?${bookingParams.toString()}`;

      if (!session || !session.user.id) {
        // If not logged in, redirect to sign in
        router.push(`/auth/signin?redirect=${encodeURIComponent(bookingUrl)}`);
        return;
      }

      // Check if profile is complete
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();

      if (!profile?.full_name) {
        // If profile incomplete, redirect to complete profile
        router.push(
          `/auth/complete-profile?redirect=${encodeURIComponent(bookingUrl)}`
        );
        return;
      }

      // If all good, proceed to booking
      router.push(bookingUrl);
    } catch (error) {
      console.error("Error during booking:", error);
    } finally {
      setIsRedirecting(false);
      setProcessingFlightId(null);
    }
  };

  if (flights.length === 0) {
    return <p>No flights available.</p>;
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <div
          key={flight.id}
          className={`p-4 border rounded-lg ${
            selectedFlight === flight.id
              ? "border-blue-500 bg-blue-50 text-gray-700"
              : ""
          }`}
          onClick={() => handleSelectFlight(flight.id)}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 max-md:w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-bold">{flight.airline}</span>
                <span className="text-gray-500 text-sm">
                  Flight {flight.flight_number}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="font-bold">
                    {formatTime(flight.departure_time)}
                  </div>
                  <div className="text-sm">{flight.origin}</div>
                </div>

                <div className="flex-1 px-2">
                  <div className="text-xs text-center text-gray-500">
                    {formatDuration(flight.duration)}
                  </div>
                  <div className="h-px bg-gray-300 relative">
                    <div className="absolute inset-0 flex justify-center">
                      <div className="h-2 w-2 bg-gray-500 rounded-full -mt-0.5"></div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="font-bold">
                    {formatTime(flight.arrival_time)}
                  </div>
                  <div className="text-sm">{flight.destination}</div>
                </div>
              </div>
            </div>

            <div className="flex max-md:w-full flex-row md:flex-col gap-x-3 justify-between items-center md:items-end">
              <div className="flex flex-col items-start md:items-end">
                <div className="text-lg font-bold">
                  {formatCurrency(flight.price)}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {flight.cabin_class} • {flight.available_seats} seats left
                </div>
              </div>

              <button
                onClick={(e) => handleBookFlight(flight.id, e)}
                disabled={!isInitialized}
                className={`px-2 py-1 md:px-4 md:py-2 cursor-pointer bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors ${
                  !isInitialized ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Select
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
