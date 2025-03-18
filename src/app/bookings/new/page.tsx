// src/app/bookings/new/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flight } from "@/types/database.types";
import { useAuth } from "@/components/auth/AuthProvider";

type PassengerCount = {
  adults: number;
  children: number;
  infants: number;
};

type Passenger = {
  name: string;
  type: "adult" | "child" | "infant";
  passport_number?: string;
};

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="container mx-auto p-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BookingContent />
    </Suspense>
  );
}

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, loading: authLoading, supabase } = useAuth();

  const [flight, setFlight] = useState<Flight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  const flightId = searchParams.get("flightId");
  const passengersParam = searchParams.get("passengers");

  // Handle auth state
  useEffect(() => {
    if (!authLoading && !user) {
      // If not authenticated, redirect to sign in
      const currentUrl = window.location.href;
      const encodedRedirect = encodeURIComponent(currentUrl);
      router.push(`/auth/signin?redirect=${encodedRedirect}`);
    }
  }, [authLoading, user, router]);

  // Parse passenger count
  const passengerCount: PassengerCount = passengersParam
    ? JSON.parse(decodeURIComponent(passengersParam))
    : { adults: 1, children: 0, infants: 0 };

  useEffect(() => {
    // Don't fetch if not authenticated
    if (!user || !session) {
      return;
    }

    if (!flightId) {
      setError("No flight selected");
      setLoading(false);
      return;
    }

    async function fetchFlight() {
      try {
        const { data: flightData, error: flightError } = await supabase
          .from("flights")
          .select("*")
          .eq("id", flightId)
          .single();

        if (flightError) throw flightError;
        if (!flightData) throw new Error("Flight not found");

        setFlight(flightData);

        // Initialize passenger forms
        const initialPassengers: Passenger[] = [];
        for (let i = 0; i < passengerCount.adults; i++) {
          initialPassengers.push({ name: "", type: "adult" });
        }
        for (let i = 0; i < passengerCount.children; i++) {
          initialPassengers.push({ name: "", type: "child" });
        }
        for (let i = 0; i < passengerCount.infants; i++) {
          initialPassengers.push({ name: "", type: "infant" });
        }
        setPassengers(initialPassengers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch flight");
      } finally {
        setLoading(false);
      }
    }

    fetchFlight();
  }, [
    flightId,
    supabase,
    passengerCount.adults,
    passengerCount.children,
    passengerCount.infants,
    user,
    session,
  ]);

  const handlePassengerChange = (
    index: number,
    field: keyof Passenger,
    value: string
  ) => {
    setPassengers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flight || !user || !session) {
      setError("You must be logged in to create a booking");
      return;
    }

    try {
      // Create the booking using the current user's session
      console.log("user id", user.id);
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: user.id,
          flight_id: flight.id,
          booking_date: new Date().toISOString(),
          passenger_count: passengerCount,
          status: "pending",
          total_price:
            flight.price * (passengerCount.adults + passengerCount.children),
          passengers: passengers,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (bookingError) {
        console.error("Booking error:", bookingError);
        throw bookingError;
      }

      router.push(`/bookings/${bookingData.id}`);
    } catch (err) {
      console.error("Error creating booking:", err);
      setError(
        err instanceof Error
          ? `Failed to create booking: ${err.message}`
          : "Failed to create booking"
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-700 mb-2">
            Flight Not Found
          </h2>
          <p className="text-yellow-600">
            The selected flight could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Book Your Flight</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl text-gray-700 font-semibold mb-4">
          Flight Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
          <p>
            <span className="font-medium">Flight Number:</span>{" "}
            {flight.flight_number}
          </p>
          <p>
            <span className="font-medium">Airline:</span> {flight.airline}
          </p>
          <p>
            <span className="font-medium">From:</span> {flight.origin}
          </p>
          <p>
            <span className="font-medium">To:</span> {flight.destination}
          </p>
          <p>
            <span className="font-medium">Departure:</span>{" "}
            {new Date(flight.departure_time).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Arrival:</span>{" "}
            {new Date(flight.arrival_time).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Class:</span> {flight.cabin_class}
          </p>
          <p>
            <span className="font-medium">Price per person:</span> ₹
            {flight.price}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl text-gray-700 font-semibold mb-4">
            Passenger Information
          </h2>
          {passengers.map((passenger, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <h3 className="font-medium mb-3 text-gray-700">
                Passenger {index + 1} ({passenger.type})
              </h3>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor={`name-${index}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name (as on passport/ID)
                  </label>
                  <input
                    type="text"
                    id={`name-${index}`}
                    value={passenger.name}
                    onChange={(e) =>
                      handlePassengerChange(index, "name", e.target.value)
                    }
                    required
                    className="w-full p-2 border text-gray-600 border-gray-300 rounded"
                  />
                </div>

                {passenger.type !== "infant" && (
                  <div>
                    <label
                      htmlFor={`passport-${index}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Passport/ID Number (optional)
                    </label>
                    <input
                      type="text"
                      id={`passport-${index}`}
                      value={passenger.passport_number || ""}
                      onChange={(e) =>
                        handlePassengerChange(
                          index,
                          "passport_number",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border text-gray-600 border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-gray-600 mb-1">
                Total Passengers: {passengers.length}
              </p>
              <p className="text-2xl text-gray-600 font-bold">
                Total Price: ₹
                {flight.price *
                  (passengerCount.adults + passengerCount.children)}
              </p>
            </div>
            <button
              type="submit"
              className="bg-blue-600 cursor-pointer text-white px-6 py-3 rounded hover:bg-blue-700 transition w-full md:w-auto"
            >
              Confirm Booking
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
