import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";
import PostLostItem from "./pages/PostLostItem";
import ItemDetail from "./pages/ItemDetail";
import Navbar from "./components/Navbar";

function App() {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-text text-center mt-10">Loading...</p>;

  return (
    <>
      <Navbar />
      <Routes>
        {/*If user exists then lost page otherwise login page*/}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard/lost" replace /> : <Login />}
        />

        {/* The item page */}
        <Route
          path="/item/:id"
          element={
            <ProtectedRoute>
              <ItemDetail />
            </ProtectedRoute>
          }
        />

        {/*The lost item page*/}
        <Route
          path="/dashboard/lost"
          element={
            <ProtectedRoute>
              <p className="text-text m-8">Placeholder lost page</p>
            </ProtectedRoute>
          }
        />

        {/* Post lost items */}
        <Route
          path="/post-lost"
          element={
            <ProtectedRoute>
              <PostLostItem />
            </ProtectedRoute>
          }
        />

        {/*The found item page */}
        <Route
          path="/dashboard/found"
          element={
            <ProtectedRoute>
              <p className="text-text m-8">Placeholder lost page</p>
            </ProtectedRoute>
          }
        />

        {/*The admin panel*/}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <p className="text-text m-8">Placeholder lost page</p>
            </ProtectedRoute>
          }
        />

        {/*All other non existent routes go to /lost*/}
        <Route path="*" element={<Navigate to="/dashboard/lost" replace />} />
      </Routes>
    </>
  );
}

export default App;
