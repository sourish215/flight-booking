// app/bookings/[id]/page.tsx
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/database.types";

// Define types based on your data structure
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
}

export default async function Page({ params }) {
  // Await params before accessing properties
  const resolvedParams = await params;
  return <BookingDetails bookingId={resolvedParams.id} />;
}

async function BookingDetails({ bookingId }: { bookingId: string }) {
  if (!bookingId) {
    return notFound();
  }

  const supabase = createServerComponentClient<Database>({ cookies });

  // Fetch booking data using Supabase
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single<Booking>();

  if (error || !booking) {
    console.error("Error fetching booking:", error);
    notFound();
  }

  // Format the booking date
  const bookingDate = new Date(booking.booking_date);
  const formattedDate = bookingDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate time since booking
  const timeAgo = formatDistanceToNow(new Date(booking.created_at), {
    addSuffix: true,
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Booking Details</h1>
          <span
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              booking.status === "confirmed"
                ? "bg-green-100 text-green-800"
                : booking.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Booking Reference:</span>
            <span className="font-medium text-gray-600">
              {booking.id.substring(0, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Booking Date:</span>
            <span className="text-gray-600">{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Created:</span>
            <span className="text-gray-600">{timeAgo}</span>
          </div>
        </div>

        <div className="border-b pb-4 mb-4">
          <h2 className="text-lg text-gray-600 font-semibold mb-3">
            Passengers
          </h2>
          {booking.passengers.map((passenger, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span className="text-gray-600">{passenger.name}</span>
              <span className="capitalize text-gray-600">{passenger.type}</span>
            </div>
          ))}

          <div className="mt-3 text-sm text-gray-600">
            <span>Total: {booking.passenger_count.adults} adult(s), </span>
            <span>{booking.passenger_count.children} child(ren), </span>
            <span>{booking.passenger_count.infants} infant(s)</span>
          </div>
        </div>

        <div className="border-b pb-4 mb-4">
          <h2 className="text-lg text-gray-600 font-semibold mb-3">
            Flight Information
          </h2>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Flight ID:</span>
            <span className="text-gray-600">{booking.flight_id}</span>
          </div>
          {/* You could add a separate Supabase query for flight details here */}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-600">Total Price:</span>
            <span className="ml-2 text-gray-600 text-2xl font-bold">
              $
              {Number(booking.total_price).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Manage Booking
            </button>
            <button className="px-4 text-gray-600 py-2 border border-gray-300 rounded hover:bg-gray-50 transition">
              Print Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
