import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import PageContainer from "../components/PageContainer";
import { Users, Flag } from "lucide-react";

const REPORT_STATUSES = ["pending", "reviewed", "dismissed"];

const AdminPanel = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFetched, setUsersFetched] = useState(false);

  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportStatusFilter, setReportStatusFilter] = useState("");

  const [actionError, setActionError] = useState("");

  const roleColors = {
    admin: "text-error",
    student: "text-success",
  };

  // fetch users lazily, only once, when Users tab is first opened
  useEffect(() => {
    if (activeTab !== "users" || usersFetched) return;

    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const { data } = await api.get("/admin/users");
        setUsers(data.data);
        setUsersFetched(true);
      } catch (error) {
        setActionError(
          error.response?.data?.message || "Failed to load users.",
        );
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [activeTab, usersFetched]);

  // fetch reports whenever tab is reports, or filter changes
  useEffect(() => {
    if (activeTab !== "reports") return;

    const fetchReports = async () => {
      setReportsLoading(true);
      try {
        const { data } = await api.get("/reports", {
          params: { status: reportStatusFilter || undefined },
        });
        setReports(data.data);
      } catch (error) {
        setActionError(
          error.response?.data?.message || "Failed to load reports.",
        );
      } finally {
        setReportsLoading(false);
      }
    };

    fetchReports();
  }, [activeTab, reportStatusFilter]);

  const handleToggleBlock = async (userId, currentlyBlocked) => {
    setActionError("");
    try {
      await api.patch(`/admin/users/${userId}/block`, {
        blocked: !currentlyBlocked,
      });
      const { data } = await api.get("/admin/users");
      setUsers(data.data);
    } catch (error) {
      setActionError(error.response?.data?.message || "Failed to update user.");
    }
  };

  const handleReportStatus = async (reportId, status) => {
    setActionError("");
    try {
      await api.patch(`/reports/${reportId}`, { status });
      const { data } = await api.get("/reports", {
        params: { status: reportStatusFilter || undefined },
      });
      setReports(data.data);
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Failed to update report.",
      );
    }
  };

  return (
    <PageContainer maxWidth="max-w-4xl" className="py-6">
      <h1 className="text-4xl font-heading text-text mb-6">The Admin Panel</h1>

      <div className="flex gap-2 mb-6 border-b border-overlay">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                      ${
                        activeTab === "users"
                          ? "border-accent-500 text-accent-500"
                          : "border-transparent text-subtext hover:text-text"
                      }`}
        >
          <Users size={16} />
          Users
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "reports"
              ? "border-accent-500 text-accent-500"
              : "border-transparent text-subtext hover:text-text"
          }`}
        >
          <Flag size={16} />
          Reports
        </button>
      </div>

      {actionError && <p className="text-error mb-4">{actionError}</p>}

      {activeTab === "users" && (
        <div>
          {usersLoading && <p className="text-subtext">Loading users...</p>}
          {!usersLoading && users.length === 0 && (
            <p className="text-subtext">No users found.</p>
          )}
          {!usersLoading && users.length > 0 && (
            <div className="flex flex-col gap-2">
              {users.map((u) => {
                return (
                  <div
                    key={u._id}
                    className="flex items-center justify-between border border-overlay rounded-lg p-3"
                  >
                    <div>
                      <p className="text-text font-medium">{u.name}</p>
                      <p className="text-xs text-subtext">{u.email}</p>
                      {roleColors[u.role] && (
                        <p
                          className={`text-xs capitalize ${roleColors[u.role]}`}
                        >
                          {u.role}
                        </p>
                      )}
                    </div>

                    {u._id !== currentUser.id && (
                      <button
                        onClick={() => handleToggleBlock(u._id, u.blocked)}
                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                          u.blocked
                            ? "bg-success/20 text-success hover:bg-success/30"
                            : "bg-error/20 text-error hover:bg-error/30"
                        }`}
                      >
                        {u.blocked ? "Unblock" : "Block"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "reports" && (
        <div>
          <select
            value={reportStatusFilter}
            onChange={(e) => setReportStatusFilter(e.target.value)}
            className="border border-overlay bg-surface text-text p-2 rounded-lg mb-4"
          >
            <option value="">All statuses</option>
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          {reportsLoading && <p className="text-subtext">Loading reports...</p>}

          {!reportsLoading && reports.length === 0 && (
            <p className="text-subtext">No reports found.</p>
          )}

          {!reportsLoading && reports.length > 0 && (
            <div className="flex flex-col gap-2">
              {reports.map((r) => (
                <div
                  key={r._id}
                  className="border border-overlay rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-text font-medium">
                      {r.reportedBy?.name || "Unknown"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.status === "reviewed"
                          ? "bg-success/20 text-success"
                          : r.status === "dismissed"
                            ? "bg-overlay text-subtext"
                            : "bg-accent-500/20 text-accent-500"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-sm text-text mb-1">{r.reason}</p>

                  {r.targetItem && (
                    <p className="text-xs text-subtext">
                      Item: {r.targetItem.title}
                    </p>
                  )}
                  {r.targetUser && (
                    <p className="text-xs text-subtext">
                      User: {r.targetUser.name}
                    </p>
                  )}

                  {r.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleReportStatus(r._id, "reviewed")}
                        className="text-xs bg-success/20 text-success px-3 py-1 rounded-lg hover:bg-success/30 transition-colors"
                      >
                        Mark Reviewed
                      </button>
                      <button
                        onClick={() => handleReportStatus(r._id, "dismissed")}
                        className="text-xs bg-overlay text-subtext px-3 py-1 rounded-lg hover:opacity-80 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PageContainer>
  );
};

export default AdminPanel;
