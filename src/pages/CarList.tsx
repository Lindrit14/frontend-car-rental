import { useEffect, useState } from "react";
import { getCars } from "../api/cars";
import { useAuth } from "../context/AuthContext";
import AuthModal from "../components/AuthModal";
import type { Car } from "../types";

export default function CarList() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { auth } = useAuth();

  useEffect(() => {
    getCars()
      .then((data) => {
        const valid = data.filter((c) => c.brand);
        setCars(valid);
        if (data.length > 0 && valid.length === 0) {
          setError("No cars could be fetched from the backend.");
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleBook(car: Car) {
    if (!auth) {
      setAuthModalOpen(true);
      return;
    }
    alert(`Booking ${car.brand} ${car.model} — coming soon!`);
  }

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading cars…</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  }

  if (cars.length === 0) {
    return <p className="text-center mt-10 text-gray-500">No cars available.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Available Cars</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cars.map((car) => (
          <div
            key={car.id}
            className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <h2 className="text-lg font-semibold">
              {car.brand} {car.model}
            </h2>
            <p className="text-sm text-gray-500">{car.year}</p>
            <div className="mt-2 space-y-1 text-sm">
              <p>
                <span className="font-medium">Type:</span> {car.carType}
              </p>
              <p>
                <span className="font-medium">Location:</span> {car.location}
              </p>
              <p>
                <span className="font-medium">License:</span> {car.licensePlate}
              </p>
              <p>
                <span className="font-medium">Daily Rate:</span>{" "}
                €{(car.dailyRate ?? 0).toFixed(2)}
              </p>
            </div>
            <div className="mt-auto pt-3 flex items-center justify-between">
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  car.available
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {car.available ? "Available" : "Unavailable"}
              </span>
              {car.available && (
                <button
                  onClick={() => handleBook(car)}
                  className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                >
                  Book
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
