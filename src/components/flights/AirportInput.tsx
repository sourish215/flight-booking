"use client";

import { useState, useEffect, useRef } from "react";

type Airport = {
  code: string;
  name: string;
};

type AirportInputProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  airports: Airport[];
  isLoading: boolean;
};

export default function AirportInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = "City or Airport",
  required = false,
  airports,
  isLoading,
}: AirportInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredAirports, setFilteredAirports] = useState<Airport[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter airports based on input value
  useEffect(() => {
    if (!value.trim()) {
      setFilteredAirports(airports.slice(0, 5)); // Show top 5 airports when empty
      return;
    }

    const filtered = airports.filter(
      (airport) =>
        airport.code.toLowerCase().includes(value.toLowerCase()) ||
        airport.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAirports(filtered.slice(0, 10)); // Limit to 10 results
  }, [value, airports]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAirportSelect = (airport: Airport) => {
    // Create a synthetic event to pass to the onChange handler
    const syntheticEvent = {
      target: {
        name,
        value: airport.code,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(syntheticEvent);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block mb-1 text-gray-700 font-medium">
        {label}
      </label>
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
        required={required}
        autoComplete="off"
      />
      <span className="text-gray-500 text-sm">Eg: DEL, BLR, BOM</span>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-3 text-gray-500">Loading airports...</div>
          ) : filteredAirports.length > 0 ? (
            <ul>
              {filteredAirports.map((airport) => (
                <li
                  key={airport.code}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleAirportSelect(airport)}
                >
                  <div className="font-medium text-gray-700">
                    {airport.code}
                  </div>
                  <div className="text-sm text-gray-600">{airport.name}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-gray-500">No airports found</div>
          )}
        </div>
      )}
    </div>
  );
}
