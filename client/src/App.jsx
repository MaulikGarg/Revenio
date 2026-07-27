import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";
import PostItemForm from "./pages/PostItemForm";
import ItemDetail from "./pages/ItemDetail";
import Navbar from "./components/Navbar";
import ItemsDashboard from "./pages/ItemsDashboard";
import Footer from "./components/Footer";
import ProfilePanel from "./pages/ProfilePanel";
import MessagePage from "./pages/MessagePage";

function App() {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-text text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pb-8">
        <Routes>
          {/*If user exists  then lost page otherwise login page*/}
          <Route
            path="/login"
            element={
              user ? <Navigate to="/dashboard/lost" replace /> : <Login />
            }
          />

          {/* Own items */}
          <Route
            path="/my-items"
            element={
              <ProtectedRoute>
                <ItemsDashboard mine />
              </ProtectedRoute>
            }
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
              <ProtectedRoute>{<ItemsDashboard type="lost" />}</ProtectedRoute>
            }
          />

          {/* Post lost items */}
          <Route
            path="/post-lost"
            element={
              <ProtectedRoute>{<PostItemForm type="lost" />}</ProtectedRoute>
            }
          />

          {/*The found item page */}
          <Route
            path="/dashboard/found"
            element={
              <ProtectedRoute>{<ItemsDashboard type="found" />}</ProtectedRoute>
            }
          />

          {/* Post found items */}
          <Route
            path="/post-found"
            element={
              <ProtectedRoute>{<PostItemForm type="found" />}</ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProfilePanel />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages/:type/:id"
            element={
              <ProtectedRoute>
                <MessagePage />
              </ProtectedRoute>
            }
          />

          {/*All other non existent routes go to /lost*/}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
