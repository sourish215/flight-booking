export default function FlightSearchSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Search Summary Skeleton */}
      <div className="bg-gray-100 p-4 rounded">
        <div className="h-6 w-48 bg-gray-300 rounded mb-4"></div>
        <div className="flex flex-wrap gap-4">
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
          <div className="h-4 w-32 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Flight Results Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-40 bg-gray-300 rounded mb-6"></div>
        
        {/* Multiple Flight Cards */}
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="p-4 border rounded-lg"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                {/* Airline and Flight Number */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-5 w-24 bg-gray-300 rounded"></div>
                  <div className="h-4 w-20 bg-gray-300 rounded"></div>
                </div>

                {/* Flight Times and Route */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="h-6 w-16 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  </div>

                  <div className="flex-1 px-2">
                    <div className="h-3 w-full bg-gray-300 rounded"></div>
                  </div>

                  <div className="text-center">
                    <div className="h-6 w-16 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>

              {/* Price and Button */}
              <div className="flex flex-col items-end">
                <div className="h-6 w-24 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-300 rounded mb-4"></div>
                <div className="h-10 w-24 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
