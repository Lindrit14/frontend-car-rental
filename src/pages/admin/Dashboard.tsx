import { Link } from "react-router-dom";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
        <Link
          to="/admin/cars"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900">Manage Cars</h2>
          <p className="text-sm text-gray-500 mt-2">
            Add, edit, and remove cars from the fleet.
          </p>
        </Link>
        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow border border-gray-200"
        >
          <h2 className="text-lg font-semibold text-gray-900">Manage Users</h2>
          <p className="text-sm text-gray-500 mt-2">
            View and manage registered users.
          </p>
        </Link>
      </div>
    </div>
  );
}
