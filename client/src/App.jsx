import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";

function App() {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading...</p>;

  return (
    <Routes>
      {/*If user exists then lost page otherwise login page*/}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard/lost" replace /> : <Login />}
      />

      {/*The lost item page*/}
      <Route
        path="/dashboard/lost"
        element={
          <ProtectedRoute>
            <p>Placeholder lost page</p>
          </ProtectedRoute>
        }
      />

      {/*The found item page */}
      <Route
        path="/dashboard/found"
        element={
          <ProtectedRoute>
            <p>Placeholder found page</p>
          </ProtectedRoute>
        }
      />

      {/*The admin panel*/}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <p>Placeholder admin panel</p>
          </ProtectedRoute>
        }
      />

      {/*All other non existent routes go to /lost*/}
      <Route path="*" element={<Navigate to="/dashboard/lost" replace />} />
    </Routes>
  );
}

export default App;
