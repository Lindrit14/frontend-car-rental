import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../../api/users";
import type { User } from "../../types";

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function loadUsers() {
    setLoading(true);
    getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setError(null);
    try {
      await deleteUser(userId);
      loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  if (loading) {
    return <p className="text-gray-500">Loading users...</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</p>
      )}

      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-700">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">First Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Last Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Role</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.firstName}</td>
                  <td className="px-4 py-3">{user.lastName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
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
