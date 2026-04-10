import { useEffect, useState, type FormEvent } from "react";
import Modal from "./Modal";
import { createBooking } from "../api/bookings";
import type { CarType } from "../types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingParams: { type: CarType; location: string; dailyRate: number } | null;
  onSuccess: () => void;
  initialStartDate?: string;
  initialEndDate?: string;
}

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

export default function BookingModal({
  isOpen,
  onClose,
  bookingParams,
  onSuccess,
  initialStartDate,
  initialEndDate,
}: BookingModalProps) {
  const [startDate, setStartDate] = useState(initialStartDate ?? "");
  const [endDate, setEndDate] = useState(initialEndDate ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      return;
    }

    setStartDate(initialStartDate ?? "");
    setEndDate(initialEndDate ?? "");
    setError(null);
  }, [isOpen, initialStartDate, initialEndDate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!bookingParams) return;

    setError(null);
    setSubmitting(true);

    try {
      await createBooking({
        type: bookingParams.type,
        startDate,
        endDate,
        location: bookingParams.location,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!bookingParams) return null;

  const days = startDate && endDate ? calcDays(startDate, endDate) : null;
  const estimatedTotal = days ? days * bookingParams.dailyRate : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-1">Book {bookingParams.type}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {bookingParams.location} · ${bookingParams.dailyRate.toFixed(2)}/day indicative rate
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End date
            </label>
            <input
              type="date"
              required
              min={startDate ? addDays(startDate, 1) : addDays(today(), 1)}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {estimatedTotal !== null && (
            <div className="bg-gray-50 rounded p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {days} day{days === 1 ? "" : "s"} x ${bookingParams.dailyRate.toFixed(2)}
                </span>
                <span className="font-semibold">${estimatedTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Estimated total at the indicative daily rate</p>
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

