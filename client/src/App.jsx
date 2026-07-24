import Login from "./pages/Login";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, login, logout, loading } = useAuth();
  if (loading) return <p className="flex justify-center items-center"></p>;
  if (!user) return <Login />;
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Role: {user.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default App;
