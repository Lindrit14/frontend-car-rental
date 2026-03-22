import { useState, type FormEvent } from "react";
import { searchCars } from "../api/cars";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import BookingModal from "../components/BookingModal";
import type { Car } from "../types";

function today() {
  return new Date().toISOString().split("T")[0];
}

function calcDays(start: string, end: string): number {
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

export default function CarList() {
  const [location, setLocation] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState("");
  const [returnTime, setReturnTime] = useState("10:00");

  const [cars, setCars] = useState<Car[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookingCar, setBookingCar] = useState<Car | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { auth } = useAuth();

  const days = pickupDate && returnDate ? calcDays(pickupDate, returnDate) : null;

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setCars(null);
    searchCars(`${pickupDate}T${pickupTime}:00`, `${returnDate}T${returnTime}:00`, location || undefined)
      .then((data) => {
        const valid = data.filter((c) => c.brand);
        setCars(valid);
        if (data.length > 0 && valid.length === 0) {
          setError("No cars could be fetched from the backend.");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  function handleBook(car: Car) {
    if (!auth) {
      setAuthModalOpen(true);
      return;
    }
    setBookingCar(car);
  }

  function handleBookingSuccess() {
    setSuccessMessage("Booking created successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  }

  const pickupDateTime = pickupDate && pickupTime ? `${pickupDate}T${pickupTime}:00` : "";
  const returnDateTime = returnDate && returnTime ? `${returnDate}T${returnTime}:00` : "";

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-cyan-500 via-teal-500 to-blue-500 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-6 pt-12 pb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
            Rental cars — search, compare &amp; save
          </h1>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-lg shadow-lg p-3 flex flex-col lg:flex-row items-stretch lg:items-center gap-2"
          >
            {/* Location */}
            <div className="flex-[2] min-w-0">
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 px-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Airport, city or station"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-200"
              />
            </div>

            {/* Pickup Date + Time */}
            <div className="flex gap-1 flex-1">
              <div className="flex-[2]">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 px-1">
                  Pickup date
                </label>
                <input
                  type="date"
                  required
                  min={today()}
                  value={pickupDate}
                  onChange={(e) => {
                    setPickupDate(e.target.value);
                    if (returnDate && e.target.value > returnDate) setReturnDate("");
                  }}
                  className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-200"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 px-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-200"
                />
              </div>
            </div>

            {/* Return Date + Time */}
            <div className="flex gap-1 flex-1">
              <div className="flex-[2]">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 px-1">
                  Return date
                </label>
                <input
                  type="date"
                  required
                  min={pickupDate || today()}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-200"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 px-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-200"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="flex-shrink-0 self-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-2.5 rounded text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {successMessage && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded">
            {successMessage}
          </div>
        )}

        {error && (
          <p className="text-center mt-6 text-red-500">Error: {error}</p>
        )}

        {loading && (
          <p className="text-center mt-10 text-gray-500">Searching available cars...</p>
        )}

        {cars !== null && !loading && cars.length === 0 && !error && (
          <p className="text-center mt-10 text-gray-500">
            No cars available for the selected dates and location.
          </p>
        )}

        {cars !== null && cars.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {cars.length} car{cars.length !== 1 ? "s" : ""} available
            </h2>
            <div className="space-y-4">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col sm:flex-row overflow-hidden"
                >
                  {/* Car Image */}
                  <div className="sm:w-56 h-44 sm:h-auto flex-shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {car.imageUrl ? (
                      <img
                        src={car.imageUrl}
                        alt={`${car.brand} ${car.model}`}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <svg className="w-20 h-20 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                      </svg>
                    )}
                  </div>

                  {/* Car Details */}
                  <div className="flex-1 p-4 flex flex-col sm:flex-row">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {car.brand} {car.model}
                      </h3>

                      <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                          </svg>
                          {car.seats ?? "–"} seats
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          {car.transmission ?? "–"}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
                          </svg>
                          {car.largeLuggageSpace ?? 0} large bag{(car.largeLuggageSpace ?? 0) !== 1 ? "s" : ""}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H4v-2h10v2zm4-4H4V8h14v4z" />
                          </svg>
                          {car.smallLuggageSpace ?? 0} small bag{(car.smallLuggageSpace ?? 0) !== 1 ? "s" : ""}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                        </svg>
                        {car.location}
                      </div>
                    </div>

                    {/* Price + Book */}
                    <div className="sm:ml-6 mt-4 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-3 sm:min-w-[140px]">
                      <div className="text-right">
                        {days && (
                          <p className="text-xs text-gray-400">
                            Price for {days} day{days !== 1 ? "s" : ""}:
                          </p>
                        )}
                        <p className="text-2xl font-bold text-gray-900">
                          €{days ? ((car.dailyRate ?? 0) * days).toFixed(0) : (car.dailyRate ?? 0).toFixed(0)}
                          {!days && <span className="text-sm font-normal text-gray-500">/day</span>}
                        </p>
                      </div>
                      <button
                        onClick={() => handleBook(car)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
                      >
                        View offer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {cars === null && !loading && !error && (
          <div className="text-center mt-16 text-gray-400">
            <p className="text-lg">Enter your dates and location to find available cars.</p>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <BookingModal
        isOpen={bookingCar !== null}
        onClose={() => setBookingCar(null)}
        car={bookingCar}
        onSuccess={handleBookingSuccess}
        initialPickupDateTime={pickupDateTime}
        initialReturnDateTime={returnDateTime}
      />
    </div>
  );
}
