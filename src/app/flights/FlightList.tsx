// // src/components/flights/FlightList.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { Flight } from "@/types/database.types";
// import {
//   formatDuration,
//   formatTime,
//   formatCurrency,
// } from "@/lib/utils/formatters";
// import { useAuth } from "@/components/auth/AuthProvider";
// import { createSupabaseClient } from "@/lib/supabase/client";

// type FlightListProps = {
//   flights: Flight[];
//   type: "outbound" | "return";
//   passengers: {
//     adults: number;
//     children: number;
//     infants: number;
//   };
// };

// export default function FlightList({
//   flights,
//   type,
//   passengers,
// }: FlightListProps) {
//   const router = useRouter();
//   const { user, loading: authLoading } = useAuth();
//   const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
//   const [isRedirecting, setIsRedirecting] = useState(false);
//   const [authChecked, setAuthChecked] = useState(false);

//   // Check auth state once auth is no longer loading
//   useEffect(() => {
//     const checkAuth = async () => {
//       if (!authLoading && !authChecked) {
//         const supabase = createSupabaseClient();
//         const {
//           data: { session: currentSession },
//         } = await supabase.auth.getSession();
//         console.log("Initial auth check:", {
//           currentSession,
//           user,
//           authLoading,
//         });
//         setAuthChecked(true);
//       }
//     };
//     checkAuth();
//   }, [authLoading, authChecked, user]);

//   // Setup IndexedDB for offline caching
//   useEffect(() => {
//     if (typeof window !== "undefined" && flights.length > 0) {
//       const request = indexedDB.open("flightBookingDB", 1);

//       request.onupgradeneeded = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
//         if (!db.objectStoreNames.contains("flights")) {
//           db.createObjectStore("flights", { keyPath: "id" });
//         }
//       };

//       request.onsuccess = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
//         const tx = db.transaction("flights", "readwrite");
//         const store = tx.objectStore("flights");

//         // Cache all flights
//         flights.forEach((flight) => {
//           store.put({
//             ...flight,
//             cached_at: new Date().toISOString(),
//             search_type: type,
//           });
//         });
//       };
//     }
//   }, [flights, type]);

//   const handleSelectFlight = (flightId: string) => {
//     setSelectedFlight(flightId);
//   };

//   const handleBookFlight = async (flightId: string) => {
//     console.log("handleBookFlight called with flightId:", flightId);
//     // Prevent multiple clicks while processing
//     if (isRedirecting) return;
//     setIsRedirecting(true);

//     try {
//       const supabase = createSupabaseClient();

//       // Get current session state
//       const {
//         data: { session: currentSession },
//       } = await supabase.auth.getSession();
//       console.log("Current auth state:", { currentSession, user });

//       // If not logged in, redirect to sign in
//       if (!currentSession?.user) {
//         console.log("No session found, redirecting to sign in...");
//         // Create booking parameters with all search params
//         const currentUrl = new URL(window.location.href);
//         const bookingParams = new URLSearchParams({
//           flightId,
//           passengers: JSON.stringify(passengers),
//           origin: currentUrl.searchParams.get("origin") || "",
//           destination: currentUrl.searchParams.get("destination") || "",
//           departureDate: currentUrl.searchParams.get("departureDate") || "",
//           cabinClass: currentUrl.searchParams.get("cabinClass") || "",
//           tripType: currentUrl.searchParams.get("tripType") || "",
//         });

//         // Create the booking URL to return to after login
//         const bookingUrl = `/bookings/new?${bookingParams.toString()}`;
//         const encodedRedirect = encodeURIComponent(bookingUrl);

//         // Redirect to sign in
//         router.push(`/auth/signin?redirect=${encodedRedirect}`);
//         return;
//       }

//       // If logged in, proceed with booking
//       console.log("User is authenticated, proceeding with booking...");
//       const { data: profile } = await supabase
//         .from("profiles")
//         .select("full_name")
//         .eq("id", currentSession.user.id)
//         .single();

//       console.log("Profile data:", profile);

//       // If profile is incomplete, redirect to complete profile
//       if (!profile?.full_name) {
//         const currentUrl = new URL(window.location.href);
//         const bookingParams = new URLSearchParams({
//           flightId,
//           passengers: JSON.stringify(passengers),
//           origin: currentUrl.searchParams.get("origin") || "",
//           destination: currentUrl.searchParams.get("destination") || "",
//           departureDate: currentUrl.searchParams.get("departureDate") || "",
//           cabinClass: currentUrl.searchParams.get("cabinClass") || "",
//           tripType: currentUrl.searchParams.get("tripType") || "",
//         });
//         const bookingUrl = `/bookings/new?${bookingParams.toString()}`;
//         const encodedRedirect = encodeURIComponent(bookingUrl);

//         router.push(`/auth/complete-profile?redirect=${encodedRedirect}`);
//         return;
//       }

//       // If profile is complete, proceed with booking
//       const currentUrl = new URL(window.location.href);
//       const bookingParams = new URLSearchParams({
//         flightId,
//         passengers: JSON.stringify(passengers),
//         origin: currentUrl.searchParams.get("origin") || "",
//         destination: currentUrl.searchParams.get("destination") || "",
//         departureDate: currentUrl.searchParams.get("departureDate") || "",
//         cabinClass: currentUrl.searchParams.get("cabinClass") || "",
//         tripType: currentUrl.searchParams.get("tripType") || "",
//       });

//       const bookingUrl = `/bookings/new?${bookingParams.toString()}`;
//       router.push(bookingUrl);
//     } catch (error) {
//       console.error("Error during booking:", error);
//     } finally {
//       setIsRedirecting(false);
//     }
//   };

//   if (flights.length === 0) {
//     return <p>No flights available.</p>;
//   }

//   return (
//     <div className="space-y-4">
//       {flights.map((flight) => (
//         <div
//           key={flight.id}
//           className={`p-4 border rounded-lg ${
//             selectedFlight === flight.id ? "border-blue-500 bg-blue-50" : ""
//           }`}
//           onClick={() => handleSelectFlight(flight.id)}
//         >
//           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//             <div className="flex-1">
//               <div className="flex items-center gap-2 mb-2">
//                 <span className="font-bold">{flight.airline}</span>
//                 <span className="text-gray-500 text-sm">
//                   Flight {flight.flight_number}
//                 </span>
//               </div>

//               <div className="flex items-center gap-4">
//                 <div className="text-center">
//                   <div className="font-bold">
//                     {formatTime(flight.departure_time)}
//                   </div>
//                   <div className="text-sm">{flight.origin}</div>
//                 </div>

//                 <div className="flex-1 px-2">
//                   <div className="text-xs text-center text-gray-500">
//                     {formatDuration(flight.duration)}
//                   </div>
//                   <div className="h-px bg-gray-300 relative">
//                     <div className="absolute inset-0 flex justify-center">
//                       <div className="h-2 w-2 bg-gray-500 rounded-full -mt-0.5"></div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="text-center">
//                   <div className="font-bold">
//                     {formatTime(flight.arrival_time)}
//                   </div>
//                   <div className="text-sm">{flight.destination}</div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col items-end">
//               <div className="text-lg font-bold">
//                 {formatCurrency(flight.price)}
//               </div>
//               <div className="text-sm text-gray-500 mb-2">
//                 {flight.cabin_class} • {flight.available_seats} seats left
//               </div>

//               <button
//                 onClick={() => handleBookFlight(flight.id)}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
//               >
//                 Select
//               </button>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
