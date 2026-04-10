import { useState } from "react";
import { getBookingById, assignCar, returnBooking, cancelBooking } from "../../api/bookings";
import { getCarsByType } from "../../api/cars";
import type { Booking, BookingStatus, Car } from "../../types";

const statusStyles: Record<BookingStatus, string> = {
  RESERVED: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-blue-100 text-blue-700",
  RETURNED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function BookingManagement() {
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCarSelector, setShowCarSelector] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);

  async function handleLookup() {
    if (!bookingId.trim()) return;
    setLoading(true);
    setError(null);
    setBooking(null);
    setShowCarSelector(false);
    setCars([]);

    try {
      const data = await getBookingById(bookingId.trim());
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking not found");
    } finally {
      setLoading(false);
    }
  }

  async function handleAssignCar(carId: string) {
    if (!booking) return;
    setError(null);

    try {
      const updated = await assignCar(booking.id, carId);
      setBooking(updated);
      setShowCarSelector(false);
      setCars([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign car");
    }
  }

  async function handleReturn() {
    if (!booking) return;
    setError(null);

    try {
      const updated = await returnBooking(booking.id);
      setBooking(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as returned");
    }
  }

  async function handleCancel() {
    if (!booking) return;
    setError(null);

    try {
      const updated = await cancelBooking(booking.id);
      setBooking(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel booking");
    }
  }

  async function openCarSelector() {
    if (!booking) return;
    setShowCarSelector(true);
    setCarsLoading(true);
    setError(null);

    try {
      const data = await getCarsByType(booking.type, booking.location);
      setCars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cars");
    } finally {
      setCarsLoading(false);
    }
  }

  const availableCars = booking
    ? cars.filter((car) => car.location === booking.location && car.carType === booking.type)
    : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Look Up Booking</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter Booking ID"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleLookup}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {loading ? "Searching..." : "Look Up"}
          </button>
        </div>
      </div>

      {booking && (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Booking Details</h2>
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${
                statusStyles[booking.status] ?? "bg-gray-100 text-gray-500"
              }`}
            >
              {booking.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="font-medium text-sm break-all">{booking.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="font-medium text-sm break-all">{booking.userId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Car Type</p>
              <p className="font-medium">{booking.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{booking.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{booking.startDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{booking.endDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Daily Rate</p>
              <p className="font-medium">${booking.dailyRate.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Price</p>
              <p className="font-medium">
                {booking.totalPrice != null ? `$${booking.totalPrice.toFixed(2)}` : "TBD"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Assigned Car</p>
              <p className="font-medium">{booking.carId ?? "Car not yet assigned"}</p>
            </div>
          </div>

          <div className="flex gap-3 border-t border-gray-200 pt-4">
            {booking.status === "RESERVED" && (
              <>
                <button
                  onClick={openCarSelector}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                >
                  Assign Car
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium"
                >
                  Cancel Booking
                </button>
              </>
            )}
            {booking.status === "ACTIVE" && (
              <button
                onClick={handleReturn}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
              >
                Mark Returned
              </button>
            )}
            {(booking.status === "RETURNED" || booking.status === "CANCELLED") && (
              <span className="text-sm text-gray-400">No actions available</span>
            )}
          </div>

          {showCarSelector && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold mb-1">Select a Car to Assign</h3>
              <p className="text-xs text-gray-500 mb-3">
                Showing cars that match {booking.type} in {booking.location}.
              </p>
              {carsLoading ? (
                <p className="text-gray-500 text-sm">Loading cars...</p>
              ) : availableCars.length === 0 ? (
                <p className="text-gray-500 text-sm">No matching cars are currently available.</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableCars.map((car) => (
                    <div
                      key={car.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {car.brand} {car.model} ({car.year})
                        </p>
                        <p className="text-xs text-gray-500">
                          {car.licensePlate} · ${car.dailyRate.toFixed(2)}/day
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignCar(car.id)}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowCarSelector(false)}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

