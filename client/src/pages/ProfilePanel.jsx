import { useAuth } from "../context/AuthContext";
import { LogOut, Package2 } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import AdminPanel from "../components/profile/AdminPanel";
import UserPanel from "../components/profile/UserPanel";

const ProfilePanel = () => {
  const { user, logout } = useAuth();
  return (
    <PageContainer maxWidth="max-w-4xl" className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-heading text-text">{user.name}</h1>
          <p className="text-sm text-subtext">{user.email}</p>
        </div>

        <div className="flex items-center gap-2">
          {user.role !== "admin" && (
            <Link
              to="/my-items"
              className="flex items-center gap-1 text-sm text-subtext hover:text-accent-500 hover:bg-overlay px-3 py-1.5 rounded-lg transition-colors"
            >
              <Package2 size={16} />
              My Items
            </Link>
          )}
          <button
            onClick={logout}
            className="cursor-pointer flex items-center gap-1 text-sm text-subtext hover:text-error hover:bg-error/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      {user.role === "admin" ? <AdminPanel /> : <UserPanel />}
    </PageContainer>
  );
};

export default ProfilePanel;
