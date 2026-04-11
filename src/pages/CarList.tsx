import { useState, type FormEvent } from "react";
import { getCarsByType } from "../api/cars";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import BookingModal from "../components/BookingModal";
import type { Car, CarType } from "../types";
import CityAutocomplete from "../components/CityAutocomplete";

const CAR_TYPES: CarType[] = ["ECONOMY", "COMPACT", "SUV", "VAN", "ELECTRIC", "LUXURY"];

function today() {
  return new Date().toISOString().split("T")[0];
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  return value.toISOString().split("T")[0];
}

function calcDays(start: string, end: string): number {
  const diff = new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime();
  return Math.max(1, Math.ceil(diff / 86400000));
}

function uniqueRates(cars: Car[]) {
  return [...new Set(cars.map((car) => car.dailyRate))].sort((a, b) => a - b);
}

export default function CarList() {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [carType, setCarType] = useState<CarType>("ECONOMY");
  const [cars, setCars] = useState<Car[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookingParams, setBookingParams] = useState<{ type: CarType; location: string; dailyRate: number } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { auth } = useAuth();

  const days = startDate && endDate ? calcDays(startDate, endDate) : null;
  const rates = cars ? uniqueRates(cars) : [];
  const lowestRate = rates[0] ?? null;
  const highestRate = rates[rates.length - 1] ?? null;

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setCars(null);

    getCarsByType(carType, location.trim())
      .then((data) => {
        setCars(data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  function handleBook(type: CarType, loc: string, dailyRate: number) {
    if (!auth) {
      setAuthModalOpen(true);
      return;
    }

    setBookingParams({ type, location: loc, dailyRate });
  }

  function handleBookingSuccess() {
    setSuccessMessage("Booking created successfully. A matching car will be assigned by our team.");
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  return (
    <div>
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
            Rental cars - search by type, dates, and location
          </h1>

          <form
            onSubmit={handleSearch}
            className="bg-white rounded-lg shadow-lg p-3 flex flex-col lg:flex-row items-stretch lg:items-center gap-2"
          >
            <div className="flex-[2] min-w-0">
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 px-1">
                Location
              </label>
              <CityAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="Airport, city or station"
                className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-200"
                required
              />
            </div>

            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 px-1">
                Car type
              </label>
              <select
                value={carType}
                onChange={(e) => setCarType(e.target.value as CarType)}
                className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-200"
              >
                {CAR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 px-1">
                Start date
              </label>
              <input
                type="date"
                required
                min={today()}
                value={startDate}
                onChange={(e) => {
                  const nextStartDate = e.target.value;
                  setStartDate(nextStartDate);
                  if (endDate && nextStartDate && endDate <= nextStartDate) {
                    setEndDate("");
                  }
                }}
                className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-200"
              />
            </div>

            <div className="flex-1">
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 px-1">
                End date
              </label>
              <input
                type="date"
                required
                min={startDate ? addDays(startDate, 1) : addDays(today(), 1)}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 border border-gray-200"
              />
            </div>

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

      <div className="max-w-5xl mx-auto px-6 py-8">
        {successMessage && (
          <div className="mb-4 text-sm text-green-700 bg-green-50 p-3 rounded">
            {successMessage}
          </div>
        )}

        {error && <p className="text-center mt-6 text-red-500">Error: {error}</p>}

        {loading && (
          <p className="text-center mt-10 text-gray-500">Searching available cars...</p>
        )}

        {cars !== null && !loading && cars.length === 0 && !error && (
          <p className="text-center mt-10 text-gray-500">
            No cars available for the selected type and location.
          </p>
        )}

        {cars !== null && !loading && cars.length > 0 && lowestRate !== null && highestRate !== null && (
          <div className="border border-gray-200 rounded-2xl shadow-sm bg-white overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8 lg:items-center">
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
                  Type-based booking
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  {carType} in {location}
                </h2>
                <p className="mt-3 text-sm text-gray-600 max-w-2xl">
                  Your booking reserves a vehicle category, not a specific car. The exact vehicle is assigned later by the admin team based on availability.
                </p>
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                    <p className="text-gray-500">Available cars</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">{cars.length}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                    <p className="text-gray-500">Daily rate range</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">
                      ${lowestRate.toFixed(2)}{lowestRate !== highestRate ? ` - $${highestRate.toFixed(2)}` : ""}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
                    <p className="text-gray-500">Rental period</p>
                    <p className="mt-1 text-xl font-semibold text-gray-900">
                      {days ?? 0} day{days === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <p className="text-sm font-medium text-gray-700">Indicative daily rates</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rates.map((rate) => (
                      <span
                        key={rate}
                        className="px-3 py-1.5 rounded-full bg-cyan-50 text-cyan-800 text-sm border border-cyan-100"
                      >
                        ${rate.toFixed(2)}/day
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:w-72 rounded-2xl bg-slate-900 text-white p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Estimated from</p>
                <p className="mt-3 text-4xl font-bold">
                  ${((days ?? 1) * lowestRate).toFixed(2)}
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  {days ? `${days} day${days === 1 ? "" : "s"} at the lowest available rate.` : "Select dates to see a trip estimate."}
                </p>
                <button
                  onClick={() => handleBook(carType, location.trim(), lowestRate)}
                  className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-semibold px-5 py-3 rounded transition-colors"
                >
                  Book {carType}
                </button>
              </div>
            </div>
          </div>
        )}

        {cars === null && !loading && !error && (
          <div className="text-center mt-16 text-gray-400">
            <p className="text-lg">Enter your location, car type, and dates to find an available category.</p>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
      <BookingModal
        isOpen={bookingParams !== null}
        onClose={() => setBookingParams(null)}
        bookingParams={bookingParams}
        onSuccess={handleBookingSuccess}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </div>
  );
}

