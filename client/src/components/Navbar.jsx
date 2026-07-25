import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="grid grid-cols-3 items-center border-b border-overlay bg-surface px-4 py-2 sm:px-6 sm:py-2.5">
      {/* LEFT */}
      <div>
        <Link
          to={user ? "/dashboard/lost" : "/login"}
          className="text-xl sm:text-2xl font-bold font-pixel"
        >
          Revenio
        </Link>
      </div>

      {/* CENTER */}
      <div className="justify-self-center flex gap-2 sm:gap-6">
        {user && (
          <>
            <Link
              to="/dashboard/lost"
              className="text-subtext hover:underline hover:text-accent-500 transition-colors text-sm sm:text-base"
            >
              Lost
            </Link>
            <Link
              to="/dashboard/found"
              className="text-subtext hover:underline hover:text-accent-500 transition-colors text-sm sm:text-base"
            >
              Found
            </Link>
            <Link
              to="/post-lost"
              className="text-subtext hover:underline hover:text-accent-500 transition-colors text-sm sm:text-base"
            >
              Post Lost
            </Link>
            <Link
              to="/post-found"
              className="text-subtext hover:underline hover:text-accent-500 transition-colors text-sm sm:text-base"
            >
              Post Found
            </Link>
            {user.role === "admin" && (
              <Link
                to="/admin"
                className="text-subtext hover:underline hover:text-accent-500 transition-colors text-sm sm:text-base"
              >
                Admin
              </Link>
            )}
          </>
        )}
      </div>

      {/* RIGHT */}
      <div className="justify-self-end flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="text-lg px-1.5 py-1 rounded-lg hover:bg-overlay transition-colors"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {user && (
          <div className="flex items-center gap-2 border-l border-overlay pl-2 sm:pl-3">
            {/* Inline layout instead of double-stacked flex-col */}
            <span className="text-sm text-subtext font-medium hidden sm:inline">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="text-xs sm:text-sm text-subtext hover:text-accent-500 hover:underline transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
