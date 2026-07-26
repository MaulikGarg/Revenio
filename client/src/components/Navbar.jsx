import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  Sun,
  Moon,
  LogOut,
  PackageSearch,
  PackageCheck,
  ShieldUser,
  Package2,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isLostActive = location.pathname.startsWith("/dashboard/lost");
  const isFoundActive = location.pathname.startsWith("/dashboard/found");
  const isAdminActive = location.pathname.startsWith("/admin");

  return (
    <nav className="grid grid-cols-3 items-center border-b border-overlay bg-surface px-4 py-2 sm:px-6 sm:py-2.5">
      {/* LEFT */}
      <div>
        <Link
          to={user ? "/dashboard/lost" : "/login"}
          className="text-xl sm:text-2xl md:text-3xl font-bold font-pixel"
        >
          Revenio
        </Link>
      </div>

      {/* CENTER */}
      <div className="justify-self-center flex items-center gap-2.5 sm:gap-4 w-max">
        {user && (
          <>
            <Link
              to="/dashboard/lost"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap ${
                isLostActive
                  ? "bg-peach/20 text-peach font-medium"
                  : "text-subtext hover:text-peach"
              }`}
            >
              <PackageSearch size={16} />
              Lost
            </Link>

            <span className="h-3.5 w-px bg-overlay/80" />

            <Link
              to="/dashboard/found"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap ${
                isFoundActive
                  ? "bg-blue/20 text-blue font-medium"
                  : "text-subtext hover:text-blue"
              }`}
            >
              <PackageCheck size={16} />
              Found
            </Link>

            {user.role === "admin" && (
              <>
                <span className="h-3.5 w-px bg-overlay/80" />
                <Link
                  to="/admin"
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors text-xs sm:text-sm whitespace-nowrap ${
                    isAdminActive
                      ? "bg-error/20 text-error font-medium"
                      : "text-subtext hover:text-error"
                  }`}
                >
                  <ShieldUser size={16} />
                  Admin
                </Link>
              </>
            )}
          </>
        )}
      </div>

      {/* RIGHT */}

      <div className="justify-self-end flex items-center gap-3">
        {user && (
          <Link
            to="/my-items"
            className="text-lg px-1.5 py-1 rounded-lg hover:bg-overlay cursor-pointer"
          >
            <Package2 size={18} />
          </Link>
        )}

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
