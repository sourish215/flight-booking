"use client";

type LoaderOverlayProps = {
  message?: string;
};

export default function LoaderOverlay({
  message = "Loading...",
}: LoaderOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 flex flex-col items-center space-y-4 shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
}
