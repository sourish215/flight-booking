"use client";

import CancelBooking from "./CancelBooking";

interface BookingClientActionsProps {
  bookingId: string;
  status: string;
}

export default function BookingClientActions({
  bookingId,
  status,
}: BookingClientActionsProps) {
  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-row flex-wrap gap-2 justify-end">
      {/* Print button */}
      <button
        onClick={handlePrint}
        className="px-2 py-1 md:px-4 md:py-2 cursor-pointer border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition print:hidden flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </svg>
        Print
      </button>

      {/* Cancel booking functionality */}
      <CancelBooking bookingId={bookingId} currentStatus={status} />
    </div>
  );
}
