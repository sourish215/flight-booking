// src/app/page.tsx
import FlightSearchForm from "@/components/flights/FlightSearchForm";

export default function Home() {
  return (
    <div className="space-y-8">
      <section className="bg-blue-50 p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl text-gray-800 font-bold mb-4">
          Find Your Next Adventure
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Search and book flights to destinations worldwide.
        </p>
        <FlightSearchForm />
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Easy Booking</h2>
          <p>Book your flight in minutes with our simple booking process.</p>
        </div>
        {/* <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Real-time Updates</h2>
          <p>Get instant notifications about your flight status.</p>
        </div> */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Flexible Options</h2>
          <p>Change or cancel your booking when plans change.</p>
        </div>
      </section>
    </div>
  );
}
