import { useEffect, useState } from "react";
import { Flag } from "lucide-react";
import api from "../api/axios";

const ReportButton = ({ targetItem, targetUser, label = "Report" }) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingStatus, setExistingStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  // get existing reports
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const { data } = await api.get("/reports/mine", {
          params: { targetItem, targetUser },
        });
        const pending = data.data.find((r) => r.status === "pending");
        if (pending) setExistingStatus("pending");
      } catch (error) {
        console.error("Failed to check existing reports:", error);
      } finally {
        setChecking(false);
      }
    };
    checkExisting();
  }, [targetItem, targetUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      await api.post("/reports", {
        targetItem,
        targetUser,
        reason,
      });
      setSuccess(true);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };
  if (checking) return null;
  if (success || existingStatus === "pending") {
    return (
      <p className="text-xs text-subtext flex items-center gap-1">
        <Flag size={12} />
        {success ? "Report submitted." : "Report pending review."}
      </p>
    );
  }

  return (
    <div>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1 text-xs text-subtext hover:text-error transition-colors cursor-pointer"
        >
          <Flag size={12} />
          {label}
        </button>
      )}
      {open && (
        <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
          {error && <p className="text-error text-xs">{error}</p>}
          <textarea
            placeholder="Why are you reporting this?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg text-sm w-full"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="text-xs bg-error/20 text-error px-3 py-1 rounded-lg hover:bg-error/30 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-subtext hover:text-text transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReportButton;
