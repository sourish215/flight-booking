import { NextResponse } from "next/server";
import { createDirectSupabaseClient } from "@/lib/supabase/server";

// Create a mapping of airport codes to airport names
const airportNames = {
  DEL: "Delhi, India",
  BOM: "Mumbai, India",
  BLR: "Bangalore, India",
  MAA: "Chennai, India",
  CCU: "Kolkata, India",
  HYD: "Hyderabad, India",
  COK: "Kochi, India",
  PNQ: "Pune, India",
  LKO: "Lucknow, India",
  AMD: "Ahmedabad, India",
  GOI: "Goa, India",
  JAI: "Jaipur, India",
  UDR: "Udaipur, India",
  DXB: "Dubai, UAE",
  SIN: "Singapore",
  LHR: "London, UK",
  JFK: "New York, USA",
  BKK: "Bangkok, Thailand",
  KUL: "Kuala Lumpur, Malaysia",
  HKG: "Hong Kong",
  NRT: "Tokyo, Japan",
  CDG: "Paris, France",
  SYD: "Sydney, Australia",
  YYZ: "Toronto, Canada",
  SFO: "San Francisco, USA",
};

// Hardcoded list of airports based on the data we've added to the database
const fallbackAirportCodes = [
  "DEL",
  "BOM",
  "BLR",
  "MAA",
  "CCU",
  "HYD",
  "COK",
  "PNQ",
  "LKO",
  "AMD",
  "GOI",
  "JAI",
  "UDR",
  "DXB",
  "SIN",
  "LHR",
  "JFK",
  "BKK",
  "KUL",
  "HKG",
  "NRT",
  "CDG",
  "SYD",
  "YYZ",
  "SFO",
];

export async function GET() {
  try {
    console.log("Airports API: Starting to fetch airports");

    let originCodes: string[] = [];
    let destinationCodes: string[] = [];
    let allAirportCodes: string[] = [];

    try {
      // Try to fetch from database first using direct client
      const supabase = createDirectSupabaseClient();
      console.log("Airports API: Supabase client created");

      // Get all unique origins
      console.log("Airports API: Fetching origins");
      const { data: origins, error: originsError } = await supabase
        .from("flights")
        .select("origin")
        .order("origin")
        .not("origin", "is", null);

      if (originsError) {
        console.error("Error fetching origins:", originsError);
        throw originsError;
      }
      console.log(`Airports API: Found ${origins.length} origins`);
      originCodes = [...new Set(origins.map((item) => item.origin))];

      // Get all unique destinations
      console.log("Airports API: Fetching destinations");
      const { data: destinations, error: destinationsError } = await supabase
        .from("flights")
        .select("destination")
        .order("destination")
        .not("destination", "is", null);

      if (destinationsError) {
        console.error("Error fetching destinations:", destinationsError);
        throw destinationsError;
      }
      console.log(`Airports API: Found ${destinations.length} destinations`);
      destinationCodes = [
        ...new Set(destinations.map((item) => item.destination)),
      ];

      // Combine and deduplicate to get all unique airport codes
      allAirportCodes = [
        ...new Set([...originCodes, ...destinationCodes]),
      ].sort();
      console.log(
        `Airports API: Found ${allAirportCodes.length} unique airports from database`
      );
    } catch (dbError) {
      console.error(
        "Error fetching from database, using fallback data:",
        dbError
      );
      // Use fallback data if database query fails
      allAirportCodes = fallbackAirportCodes;
      originCodes = fallbackAirportCodes;
      destinationCodes = fallbackAirportCodes;
      console.log("Airports API: Using fallback airport data");
    }

    // Format the response with both code and name
    const formattedAirports = allAirportCodes.map((code) => ({
      code,
      name: airportNames[code] || code,
    }));

    console.log("Airports API: Successfully formatted airport data");

    return NextResponse.json({
      airports: formattedAirports,
      origins: originCodes,
      destinations: destinationCodes,
    });
  } catch (err) {
    console.error("Unexpected error in airports API:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
