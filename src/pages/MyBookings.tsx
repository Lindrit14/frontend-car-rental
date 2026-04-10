import { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../api/bookings";
import type { Booking, BookingStatus } from "../types";

const statusStyles: Record<BookingStatus, string> = {
  RESERVED: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-blue-100 text-blue-700",
  RETURNED: "bg-green-100 text-green-700",
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
    return <p className="text-center mt-10 text-gray-500">Loading bookings...</p>;
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
            <h2 className="text-lg font-semibold">{b.type}</h2>
            <p className="text-sm text-gray-500">{b.location}</p>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="font-medium">Start:</span> {b.startDate}
              </p>
              <p>
                <span className="font-medium">End:</span> {b.endDate}
              </p>
              <p>
                <span className="font-medium">Daily Rate:</span> ${b.dailyRate.toFixed(2)}
              </p>
              <p>
                <span className="font-medium">Total:</span>{" "}
                {b.totalPrice != null ? `$${b.totalPrice.toFixed(2)}` : "TBD"}
              </p>
              <p>
                <span className="font-medium">Car:</span>{" "}
                {b.carId ?? "Not yet assigned"}
              </p>
            </div>
            <div className="mt-auto pt-3 flex items-center justify-between">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  statusStyles[b.status] ?? "bg-gray-100 text-gray-500"
                }`}
              >
                {b.status}
              </span>
              {b.status === "RESERVED" && (
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
