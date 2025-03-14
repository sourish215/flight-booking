// src/app/flights/search/page.tsx
import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import FlightList from "@/components/flights/FlightList";
import FlightSearchSkeleton from "@/components/flights/FlightSearchSkeleton";
import { Flight } from "@/types/database.types";

export const revalidate = 0; // Disable caching for this page

type FlightSearchParams = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: string;
  children: string;
  infants: string;
  cabinClass: "Economy" | "Premium Economy" | "Business" | "First";
  tripType: "one-way" | "round-trip";
};

async function searchFlights(params: FlightSearchParams) {
  try {
    const supabase = await createServerSupabaseClient();

    // Parse numeric values
    const adults = parseInt(params.adults) || 1;
    const children = parseInt(params.children) || 0;
    const requiredSeats = adults + children;

    // Format date strings
    const departureDateStart = `${params.departureDate}T00:00:00`;
    const departureDateEnd = `${params.departureDate}T23:59:59`;

    // Search for outbound flights
    const query = supabase
      .from("flights")
      .select("*")
      .eq("origin", params.origin)
      .eq("destination", params.destination)
      .eq("cabin_class", params.cabinClass)
      .gte("departure_time", departureDateStart)
      .lte("departure_time", departureDateEnd)
      .gte("available_seats", requiredSeats);

    const { data: outboundData, error: outboundError } = await query;

    if (outboundError) {
      console.error("Error searching outbound flights:", outboundError);

      // Check if the error is related to missing table
      if (outboundError.code === "42P01") {
        console.error("The 'flights' table does not exist in the database.");
        return {
          outboundFlights: [] as Flight[],
          returnFlights: [] as Flight[],
          error:
            "Database table 'flights' does not exist. Please set up your database first.",
        };
      }

      throw new Error(`Failed to search for flights: ${outboundError.message}`);
    }

    // Ensure outbound flights are properly typed
    const outboundFlights = (outboundData || []) as Flight[];

    // Search for return flights if round-trip
    let returnFlights: Flight[] = [];

    if (params.tripType === "round-trip" && params.returnDate) {
      const returnDateStart = `${params.returnDate}T00:00:00`;
      const returnDateEnd = `${params.returnDate}T23:59:59`;

      const returnQuery = supabase
        .from("flights")
        .select("*")
        .eq("origin", params.destination)
        .eq("destination", params.origin)
        .eq("cabin_class", params.cabinClass)
        .gte("departure_time", returnDateStart)
        .lte("departure_time", returnDateEnd)
        .gte("available_seats", requiredSeats);

      const { data: returnData, error: returnError } = await returnQuery;

      if (returnError) {
        console.error("Error searching return flights:", returnError);
        throw new Error(
          `Failed to search for return flights: ${returnError.message}`
        );
      }

      // Ensure return flights are properly typed
      returnFlights = (returnData || []) as Flight[];
    }

    return {
      outboundFlights,
      returnFlights,
    };
  } catch (error) {
    console.error("Unexpected error in searchFlights:", error);
    return {
      outboundFlights: [] as Flight[],
      returnFlights: [] as Flight[],
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Splitting the component into two parts to avoid Next.js type issues
export default async function Page({ searchParams }) {
  // Await searchParams before accessing properties
  const resolvedSearchParams = await searchParams;
  return <SearchPageContent searchParams={resolvedSearchParams} />;
}

// Main async component that handles the actual implementation
async function SearchPageContent({
  searchParams,
}: {
  searchParams: FlightSearchParams;
}) {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    tripType,
    adults,
    children,
    infants,
    cabinClass,
  } = searchParams;

  return (
    <div className="space-y-6">
      <div className="bg-gray-100 p-4 rounded">
        <h1 className="text-2xl text-gray-700 font-bold mb-2">
          Flight Search Results
        </h1>
        <div className="text-gray-700 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <p>
            <span className="font-medium">From:</span> {origin}
          </p>
          <p>
            <span className="font-medium">To:</span> {destination}
          </p>
          <p>
            <span className="font-medium">Depart:</span> {departureDate}
          </p>
          {tripType === "round-trip" && returnDate && (
            <p>
              <span className="font-medium">Return:</span> {returnDate}
            </p>
          )}
          <p>
            <span className="font-medium">Passengers:</span> {adults} Adult
            {parseInt(adults) !== 1 ? "s" : ""}
            {parseInt(children) > 0 &&
              `, ${children} Child${parseInt(children) !== 1 ? "ren" : ""}`}
            {parseInt(infants) > 0 &&
              `, ${infants} Infant${parseInt(infants) !== 1 ? "s" : ""}`}
          </p>
          <p>
            <span className="font-medium">Class:</span> {cabinClass}
          </p>
        </div>
      </div>

      <Suspense fallback={<FlightSearchSkeleton />}>
        <FlightResultsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FlightResultsContent({
  searchParams,
}: {
  searchParams: FlightSearchParams;
}) {
  const { outboundFlights, returnFlights, error } = await searchFlights(
    searchParams
  );

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
        <p className="text-red-600">{error}</p>
        <div className="mt-4 p-4 bg-white rounded border border-gray-200">
          <h3 className="font-medium mb-2 text-gray-700">
            Possible Solutions:
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>
              Make sure the &apos;flights&apos; table exists in your Supabase
              database
            </li>
            <li>
              Check that the table has the correct schema with all required
              columns
            </li>
            <li>
              Verify your Supabase connection settings in the environment
              variables
            </li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Outbound Flights</h2>
        {outboundFlights.length > 0 ? (
          <FlightList
            flights={outboundFlights}
            type="outbound"
            passengers={{
              adults: parseInt(searchParams.adults) || 1,
              children: parseInt(searchParams.children) || 0,
              infants: parseInt(searchParams.infants) || 0,
            }}
          />
        ) : (
          <p className="text-gray-500 p-4 border rounded">
            No outbound flights found. Try different dates or destinations.
          </p>
        )}
      </section>

      {searchParams.tripType === "round-trip" && (
        <section>
          <h2 className="text-xl font-semibold mb-4">Return Flights</h2>
          {returnFlights.length > 0 ? (
            <FlightList
              flights={returnFlights}
              type="return"
              passengers={{
                adults: parseInt(searchParams.adults) || 1,
                children: parseInt(searchParams.children) || 0,
                infants: parseInt(searchParams.infants) || 0,
              }}
            />
          ) : (
            <p className="text-gray-500 p-4 border rounded">
              No return flights found. Try different dates.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
