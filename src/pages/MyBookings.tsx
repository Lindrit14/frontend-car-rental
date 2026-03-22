import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../api/bookings";
import type { Booking, BookingStatus } from "../types";

const statusStyles: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getMyBookings()
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await cancelBooking(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
    }
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading bookings…</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  }

  if (bookings.length === 0) {
    return <p className="text-center mt-10 text-gray-500">No bookings yet.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col"
          >
            <h2 className="text-lg font-semibold">
              {b.carBrand} {b.carModel}
            </h2>
            <p className="text-sm text-gray-500">{b.carLicensePlate}</p>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="font-medium">Pickup:</span> {new Date(b.pickupDateTime).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Return:</span> {new Date(b.returnDateTime).toLocaleString()}
              </p>
              <p>
                <span className="font-medium">Total:</span> €{(b.totalPrice ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="mt-auto pt-3 flex items-center justify-between">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  statusStyles[b.status as BookingStatus] ?? "bg-gray-100 text-gray-500"
                }`}
              >
                {b.status}
              </span>
              {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                <button
                  onClick={() => handleCancel(b.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
