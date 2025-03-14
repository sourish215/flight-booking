"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface CancelBookingProps {
  bookingId: string;
  currentStatus: string;
}

export default function CancelBooking({
  bookingId,
  currentStatus,
}: CancelBookingProps) {
  const router = useRouter();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if booking can be cancelled
  const canCancel = currentStatus !== "cancelled";

  const handleCancel = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const supabase = createClientComponentClient();

      // Update booking status to cancelled
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);

      if (updateError) {
        throw updateError;
      }

      // Success! Set state and refresh after a delay
      setIsSuccess(true);

      setTimeout(() => {
        // Close modal and refresh page to show updated status
        setIsConfirmOpen(false);
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError(err.message || "Failed to cancel booking. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Cancel Button */}
      <button
        onClick={() => setIsConfirmOpen(true)}
        disabled={!canCancel}
        className={`px-4 py-2 cursor-pointer disabled:cursor-not-allowed rounded transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
          canCancel
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
        aria-label="Cancel booking"
      >
        {currentStatus === "cancelled" ? "Cancelled" : "Cancel Booking"}
      </button>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isSuccess ? "Booking Cancelled!" : "Cancel Booking?"}
            </h3>

            {!isSuccess && (
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to cancel this booking? This action cannot
                be undone.
              </p>
            )}

            {isSuccess && (
              <div className="mb-4 text-green-600 bg-green-50 p-3 rounded-md">
                <p>Your booking has been successfully cancelled.</p>
              </div>
            )}

            {error && (
              <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-md">
                <p>{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              {!isSuccess && (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setIsConfirmOpen(false)}
                    className="px-4 py-2 disabled:cursor-not-allowed cursor-pointer text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleCancel}
                    className="px-4 py-2 cursor-pointer text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isProcessing ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      "Confirm Cancellation"
                    )}
                  </button>
                </>
              )}

              {isSuccess && (
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmOpen(false);
                    router.refresh();
                  }}
                  className="px-4 py-2 disabled:cursor-not-allowed cursor-pointer text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
