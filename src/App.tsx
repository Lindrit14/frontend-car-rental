import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import CarList from "./pages/CarList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import CarManagement from "./pages/admin/CarManagement";
import UserManagement from "./pages/admin/UserManagement";

function Header() {
  const { auth, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-900">
          Car Rental
        </Link>
        <nav className="flex items-center gap-4">
          {auth ? (
            <>
              <span className="text-sm text-gray-600">{auth.email}</span>
              <button
                onClick={logout}
                className="text-sm text-red-600 hover:underline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function HomeRoute() {
  const { auth } = useAuth();
  if (auth?.role === "ADMIN") return <Navigate to="/admin" replace />;
  return <CarList />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role !== "ADMIN") return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin routes - no Header, AdminLayout has its own sidebar */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="cars" element={<CarManagement />} />
            <Route path="users" element={<UserManagement />} />
          </Route>

          {/* Regular routes with Header */}
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-gray-50">
                <Header />
                <main>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<HomeRoute />} />
                  </Routes>
                </main>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
