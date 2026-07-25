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
    </PageContainer>
  );
};

export default AdminPanel;
