// src/components/flights/FlightSearchForm.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import AirportInput from "./AirportInput";
import { getTodayDate, isClient } from "@/lib/utils/client-utils";

type Airport = {
  code: string;
  name: string;
};

type SearchParams = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: "Economy" | "Premium Economy" | "Business" | "First";
  tripType: "one-way" | "round-trip";
};

export default function FlightSearchForm() {
  const router = useRouter();

  // Get initial date from our utility function
  const initialDate = getTodayDate();

  // State to track if we've initialized with server date
  const [isDateInitialized, setIsDateInitialized] = useState(false);

  const [searchParams, setSearchParams] = useState<SearchParams>({
    origin: "",
    destination: "",
    departureDate: initialDate,
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: "Economy",
    tripType: "one-way",
  });

  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoadingAirports, setIsLoadingAirports] = useState(true);

  // Fetch the latest date from server and update if needed
  useEffect(() => {
    // Only run this effect on the client
    if (!isClient) return;

    // Fetch the latest date from the API
    const fetchServerDate = async () => {
      try {
        const response = await fetch("/api/date");
        if (!response.ok) {
          throw new Error("Failed to fetch date from server");
        }

        const data = await response.json();
        const serverDate = data.date;

        // Update the departure date if it hasn't been changed by the user
        if (!isDateInitialized) {
          setSearchParams((prev) => ({
            ...prev,
            departureDate: serverDate,
          }));
          setIsDateInitialized(true);
        }
      } catch (error) {
        console.error("Error fetching server date:", error);
      }
    };

    fetchServerDate();
  }, [isDateInitialized]);

  // Fetch airports on component mount
  useEffect(() => {
    const fetchAirports = async () => {
      try {
        setIsLoadingAirports(true);
        const response = await fetch("/api/airports");

        if (!response.ok) {
          throw new Error("Failed to fetch airports");
        }

        const data = await response.json();
        setAirports(data.airports || []);
      } catch (error) {
        console.error("Error fetching airports:", error);
      } finally {
        setIsLoadingAirports(false);
      }
    };

    fetchAirports();
  }, []);

  // Update return date if it becomes invalid when departure date changes
  useEffect(() => {
    if (searchParams.returnDate && searchParams.departureDate) {
      const returnDate = new Date(searchParams.returnDate);
      const departureDate = new Date(searchParams.departureDate);

      if (returnDate < departureDate) {
        setSearchParams((prev) => ({
          ...prev,
          returnDate: searchParams.departureDate,
        }));
      }
    }
  }, [searchParams.departureDate, searchParams.returnDate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Special handling for date fields to prevent past dates
    if ((name === "departureDate" || name === "returnDate") && value) {
      const selectedDate = new Date(value);
      const currentDate = new Date(initialDate);

      // If selected date is in the past, use today's date instead
      if (selectedDate < currentDate) {
        setSearchParams((prev) => ({ ...prev, [name]: initialDate }));
        return;
      }

      // For return date, ensure it's not before departure date
      if (name === "returnDate" && searchParams.departureDate) {
        const departureDate = new Date(searchParams.departureDate);
        if (selectedDate < departureDate) {
          setSearchParams((prev) => ({
            ...prev,
            [name]: searchParams.departureDate,
          }));
          return;
        }
      }
    }

    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Build query string with the same parameter names as expected by the search page
    const queryParams = new URLSearchParams();
    queryParams.set("origin", searchParams.origin);
    queryParams.set("destination", searchParams.destination);
    queryParams.set("departureDate", searchParams.departureDate);

    if (searchParams.tripType === "round-trip" && searchParams.returnDate) {
      queryParams.set("returnDate", searchParams.returnDate);
    }

    // Set individual passenger counts
    queryParams.set("adults", searchParams.adults.toString());
    queryParams.set("children", searchParams.children.toString());
    queryParams.set("infants", searchParams.infants.toString());

    queryParams.set("cabinClass", searchParams.cabinClass);
    queryParams.set("tripType", searchParams.tripType);

    // Navigate to search results page
    router.push(`/flights/search?${queryParams.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Search Flights
      </h2>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="mb-4">
            <div className="flex gap-6 mb-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="one-way"
                  name="tripType"
                  value="one-way"
                  checked={searchParams.tripType === "one-way"}
                  onChange={handleInputChange}
                  className="mr-2 accent-blue-600 cursor-pointer"
                />
                <label htmlFor="one-way" className="text-gray-700 font-medium">
                  One Way
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="round-trip"
                  name="tripType"
                  value="round-trip"
                  checked={searchParams.tripType === "round-trip"}
                  onChange={handleInputChange}
                  className="mr-2 accent-blue-600 cursor-pointer"
                />
                <label
                  htmlFor="round-trip"
                  className="text-gray-700 font-medium"
                >
                  Round Trip
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AirportInput
              id="origin"
              name="origin"
              label="From"
              value={searchParams.origin}
              onChange={handleInputChange}
              placeholder="City or Airport"
              required={true}
              airports={airports}
              isLoading={isLoadingAirports}
            />

            <AirportInput
              id="destination"
              name="destination"
              label="To"
              value={searchParams.destination}
              onChange={handleInputChange}
              placeholder="City or Airport"
              required={true}
              airports={airports}
              isLoading={isLoadingAirports}
            />
          </div>
        </div>

        <div className="flex-1 md:mt-auto md:pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="departureDate"
                className="block mb-1 text-gray-700 font-medium"
              >
                Departure Date
              </label>
              <input
                type="date"
                id="departureDate"
                name="departureDate"
                value={searchParams.departureDate}
                onChange={handleInputChange}
                min={initialDate}
                className="w-full cursor-pointer p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            {searchParams.tripType === "round-trip" && (
              <div>
                <label
                  htmlFor="returnDate"
                  className="block text-gray-700 font-medium mb-1"
                >
                  Return Date
                </label>
                <input
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  value={searchParams.returnDate || ""}
                  onChange={handleInputChange}
                  min={searchParams.departureDate || initialDate}
                  disabled={searchParams.departureDate === ""}
                  className="w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                  required={searchParams.tripType === "round-trip"}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label
            htmlFor="cabinClass"
            className="block mb-1 text-gray-700 font-medium"
          >
            Cabin Class
          </label>
          <select
            id="cabinClass"
            name="cabinClass"
            value={searchParams.cabinClass}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 cursor-pointer"
          >
            <option value="Economy">Economy</option>
            <option value="Premium Economy">Premium Economy</option>
            <option value="Business">Business</option>
            <option value="First">First</option>
          </select>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label
                htmlFor="adults"
                className="block mb-1 text-gray-700 font-medium"
              >
                Adults
              </label>
              <input
                type="number"
                id="adults"
                name="adults"
                value={searchParams.adults}
                onChange={handleNumberChange}
                min="1"
                max="9"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label
                htmlFor="children"
                className="block mb-1 text-gray-700 font-medium"
              >
                Children
              </label>
              <input
                type="number"
                id="children"
                name="children"
                value={searchParams.children}
                onChange={handleNumberChange}
                min="0"
                max="9"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              />
            </div>

            <div>
              <label
                htmlFor="infants"
                className="block mb-1 text-gray-700 font-medium"
              >
                Infants
              </label>
              <input
                type="number"
                id="infants"
                name="infants"
                value={searchParams.infants}
                onChange={handleNumberChange}
                min="0"
                max="9"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="w-full md:w-auto px-8 py-4 cursor-pointer bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search Flights
        </button>
      </div>
    </form>
  );
}
