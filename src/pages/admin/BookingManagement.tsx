import { useEffect, useState } from "react";
import {
  getAllBookings,
  confirmBooking,
  completeBooking,
  cancelBooking,
} from "../../api/bookings";
import type { Booking, BookingStatus } from "../../types";

const statusStyles: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getAllBookings()
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAction(action: () => Promise<Booking>) {
    setError(null);
    try {
      await action();
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading bookings...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-700">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Car</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Dates</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Created</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{b.userEmail}</td>
                  <td className="px-4 py-3">
                    <div>{b.carBrand} {b.carModel}</div>
                    <div className="text-xs text-gray-400">{b.carLicensePlate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{new Date(b.pickupDateTime).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{new Date(b.returnDateTime).toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">€{(b.totalPrice ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        statusStyles[b.status as BookingStatus] ?? "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {b.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleAction(() => confirmBooking(b.id))}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleAction(() => cancelBooking(b.id))}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {b.status === "CONFIRMED" && (
                      <>
                        <button
                          onClick={() => handleAction(() => completeBooking(b.id))}
                          className="text-green-600 hover:underline text-sm"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleAction(() => cancelBooking(b.id))}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {(b.status === "COMPLETED" || b.status === "CANCELLED") && (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
