"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/components/auth/AuthProvider";

// Types based on the database schema
interface Passenger {
  name: string;
  type: string;
}

interface PassengerCount {
  adults: number;
  children: number;
  infants: number;
}

interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  booking_date: string;
  passenger_count: PassengerCount;
  status: string;
  total_price: string;
  passengers: Passenger[];
  created_at: string;
  updated_at: string;
  flight?: Flight; // Optional flight details if we join them
}

interface Flight {
  id: string;
  flight_number: string;
  airline: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  duration: number;
  price: string;
  cabin_class: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [authVerified, setAuthVerified] = useState(false);

  // Enhanced function to verify authentication status
  const verifyAuth = async () => {
    console.log("Verifying auth status...");
    try {
      if (!user) {
        console.log("No user in AuthContext, checking Supabase session...");
        // Double-check with Supabase directly
        const supabase = createClientComponentClient();
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          throw new Error("Failed to verify authentication status");
        }

        if (data.session) {
          console.log(
            "Session found in Supabase but not in AuthContext, waiting for sync...",
            data.session
          );
          // Give AuthContext some time to sync
          setTimeout(() => {
            setAuthVerified(true);
            fetchBookings();
          }, 1000);
          return;
        } else {
          console.log("No session found in Supabase either");
          setError("Please sign in to view your bookings");
          setAuthVerified(true);
          setLoading(false);
          return;
        }
      }

      console.log("User is authenticated:", user.id);
      setAuthVerified(true);
      fetchBookings();
    } catch (err) {
      console.error("Error verifying authentication:", err);
      setError("Error verifying authentication. Please try again.");
      setAuthVerified(true);
      setLoading(false);
    }
  };

  // Function to fetch bookings
  const fetchBookings = async () => {
    if (!user) {
      setError("Please sign in to view your bookings");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const supabase = createClientComponentClient();

      // Build the query for bookings
      const query = supabase
        .from("bookings")
        .select(
          `
          *,
          flight:flights(
            id, 
            flight_number, 
            airline, 
            origin, 
            destination, 
            departure_time, 
            arrival_time, 
            duration,
            price,
            cabin_class
          )
        `
        )
        .eq("user_id", user.id)
        .order("booking_date", { ascending: false });

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setBookings(data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // Wait for auth to load, then verify auth status
  useEffect(() => {
    if (!authLoading) {
      verifyAuth();
    }
  }, [authLoading, user]);

  const filteredBookings = useMemo(() => {
    const filteredBookings = bookings.filter((booking) => {
      if (statusFilter === "all") return true;
      return booking.status === statusFilter;
    });
    return filteredBookings;
  }, [bookings, statusFilter]);

  // Handle sign in redirection
  const handleSignIn = () => {
    router.push("/auth/signin?redirect=/bookings");
  };

  const totalCount = bookings.length;

  const confirmedCount = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed").length,
    [bookings]
  );
  const pendingCount = useMemo(
    () => bookings.filter((booking) => booking.status === "pending").length,
    [bookings]
  );
  const cancelledCount = useMemo(
    () => bookings.filter((booking) => booking.status === "cancelled").length,
    [bookings]
  );

  // Show loading state when still checking auth
  if (authLoading || !authVerified) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-white mb-6">My Bookings</h1>
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>
          <div className="h-20 bg-gray-300 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-6">My Bookings</h1>
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-xl">
            <p className="text-white mb-4">
              Please sign in to view your bookings
            </p>
            <button
              onClick={handleSignIn}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-6">My Bookings</h1>

      {/* Status Filter Tabs */}
      <div className="mb-6 bg-white/10 backdrop-blur-sm p-4 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter("confirmed")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === "confirmed"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === "pending"
                ? "bg-yellow-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("cancelled")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === "cancelled"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"></div>

          <div className="h-20 bg-gray-300 rounded mb-4"></div>
          <div className="h-20 bg-gray-300 rounded mb-4"></div>
          <div className="h-20 bg-gray-300 rounded"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg">
          <p>{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Try again
          </button>
        </div>
      )}

      {/* No Bookings State */}
      {!loading && !error && filteredBookings.length === 0 && (
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-md text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-white">
            No bookings found
          </h3>
          <p className="mt-1 text-sm text-gray-300">
            {statusFilter !== "all"
              ? `You don't have any ${statusFilter} bookings.`
              : "Start by searching for flights and making a booking."}
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Search Flights
            </Link>
          </div>
        </div>
      )}

      {/* Bookings List */}
      {!loading && !error && filteredBookings.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {filteredBookings.map((booking) => {
            // Get flight details if available
            const flight = booking.flight;
            const formattedBookingDate = format(
              parseISO(booking.booking_date),
              "MMM d, yyyy"
            );

            // Calculate passenger total
            const passengerTotal =
              booking.passenger_count.adults +
              booking.passenger_count.children +
              booking.passenger_count.infants;

            return (
              <Link
                href={`/bookings/${booking.id}`}
                key={booking.id}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-800 hover:border-gray-700"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <div>
                    <div className="text-lg font-semibold text-white">
                      {flight ? (
                        <>
                          {flight.origin} to {flight.destination}
                        </>
                      ) : (
                        <span>Flight Details</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-300">
                      Booked on {formattedBookingDate}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium mt-2 sm:mt-0 ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">
                      Booking Reference
                    </div>
                    <div className="text-white">
                      {booking.id.substring(0, 8).toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400">Passengers</div>
                    <div className="text-white">
                      {passengerTotal}{" "}
                      {passengerTotal === 1 ? "passenger" : "passengers"}
                    </div>
                  </div>

                  {flight && (
                    <>
                      <div>
                        <div className="text-sm text-gray-400">Flight</div>
                        <div className="text-white">
                          {flight.airline} • {flight.flight_number}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-400">Class</div>
                        <div className="text-white">{flight.cabin_class}</div>
                      </div>
                    </>
                  )}

                  <div className="sm:col-span-2">
                    <div className="text-sm text-gray-400">Total Price</div>
                    <div className="text-xl font-bold text-white">
                      ${parseFloat(booking.total_price).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-right">
                  <span className="text-blue-400 text-sm">View Details →</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
