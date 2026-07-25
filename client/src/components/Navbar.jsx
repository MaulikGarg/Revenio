import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, LogOut } from "lucide-react";

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
      {/* CENTER */}
      <div className="justify-self-center flex items-center gap-2.5 sm:gap-4 w-max">
        {user && (
          <>
            <Link
              to="/dashboard/lost"
              className="text-subtext hover:underline hover:text-accent-500 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              Lost
            </Link>

            <span className="h-3.5 w-px bg-overlay/80" />

            <Link
              to="/dashboard/found"
              className="text-subtext hover:underline hover:text-accent-500 transition-colors text-xs sm:text-sm whitespace-nowrap"
            >
              Found
            </Link>

            {user.role === "admin" && (
              <>
                <span className="h-3.5 w-px bg-overlay/80" />
                <Link
                  to="/admin"
                  className="text-subtext hover:underline hover:text-accent-500 transition-colors text-xs sm:text-sm whitespace-nowrap"
                >
                  Admin
                </Link>
              </>
            )}
          </>
        )}
      </div>

      {/* RIGHT */}
      <div className="justify-self-end flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="text-lg px-1.5 py-1 rounded-lg hover:bg-overlay transition-colors cursor-pointer"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user && (
          <div className="border-l border-overlay pl-2 sm:pl-3">
            <div className="flex flex-col items-end leading-tight">
              <span className="text-xs sm:text-sm text-subtext font-medium truncate max-w-xl">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-[11px] text-subtext hover:text-error transition-colors cursor-pointer"
              >
                <LogOut size={11} />
                <span className="hover:underline">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
