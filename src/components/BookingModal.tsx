import { useEffect, useState, type FormEvent } from "react";
import Modal from "./Modal";
import { createBooking } from "../api/bookings";
import type { Car } from "../types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: Car | null;
  onSuccess: () => void;
  initialPickupDateTime?: string;
  initialReturnDateTime?: string;
}

export default function BookingModal({ isOpen, onClose, car, onSuccess, initialPickupDateTime, initialReturnDateTime }: BookingModalProps) {
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [returnDateTime, setReturnDateTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPickupDateTime(initialPickupDateTime ?? "");
      setReturnDateTime(initialReturnDateTime ?? "");
      setError(null);
    }
  }, [isOpen, initialPickupDateTime, initialReturnDateTime]);

  const days =
    pickupDateTime && returnDateTime
      ? Math.max(1, Math.ceil((new Date(returnDateTime).getTime() - new Date(pickupDateTime).getTime()) / 86400000))
      : null;

  const estimatedTotal = days && car ? days * car.dailyRate : null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!car) return;
    setError(null);
    setSubmitting(true);
    try {
      await createBooking({ carId: car.id, pickupDateTime, returnDateTime });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!car) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-1">
          Book {car.brand} {car.model}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {car.carType} &middot; {car.location} &middot; €{(car.dailyRate ?? 0).toFixed(2)}/day
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup date &amp; time
            </label>
            <input
              type="datetime-local"
              required
              value={pickupDateTime}
              onChange={(e) => {
                setPickupDateTime(e.target.value);
                if (returnDateTime && e.target.value > returnDateTime) setReturnDateTime("");
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Return date &amp; time
            </label>
            <input
              type="datetime-local"
              required
              min={pickupDateTime}
              value={returnDateTime}
              onChange={(e) => setReturnDateTime(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {estimatedTotal !== null && (
            <div className="bg-gray-50 rounded p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {days} day{days! > 1 ? "s" : ""} × €{(car.dailyRate ?? 0).toFixed(2)}
                </span>
                <span className="font-semibold">€{estimatedTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Estimated total</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {submitting ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </Modal>
  );
}
