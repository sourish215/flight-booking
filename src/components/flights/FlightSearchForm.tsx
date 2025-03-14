// src/components/flights/FlightSearchForm.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

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
  const [searchParams, setSearchParams] = useState<SearchParams>({
    origin: "",
    destination: "",
    departureDate: "",
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: "Economy",
    tripType: "one-way",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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
                  className="mr-2 accent-blue-600"
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
                  className="mr-2 accent-blue-600"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="origin"
                className="block mb-1 text-gray-700 font-medium"
              >
                From
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={searchParams.origin}
                onChange={handleInputChange}
                placeholder="City or Airport"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                required
              />
              <span className="text-gray-500 text-sm">Eg: DEL, BLR, BOM</span>
            </div>

            <div>
              <label
                htmlFor="destination"
                className="block mb-1 text-gray-700 font-medium"
              >
                To
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={searchParams.destination}
                onChange={handleInputChange}
                placeholder="City or Airport"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                required
              />
              <span className="text-gray-500 text-sm">Eg: DEL, BLR, BOM</span>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
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
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
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
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
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
