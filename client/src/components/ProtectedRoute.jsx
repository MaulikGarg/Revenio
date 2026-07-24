import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// wrapper to check if user exists
const protectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Naviage to="/dashboard/lost" replace />;
  }

  return children;
};

export default protectedRoute;
