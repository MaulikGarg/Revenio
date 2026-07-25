import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// wrapper to check if user exists
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard/lost" replace />;
  }

  return children;
};

export default ProtectedRoute;
