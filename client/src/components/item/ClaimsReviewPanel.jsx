import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import ReportButton from "../ReportButton";

const ClaimsReviewPanel = ({ item, onItemUpdate }) => {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimActionError, setClaimActionError] = useState("");
  const isPoster = item?.postedBy._id === user.id;
  const isAdmin = user.role === "admin";

  useEffect(() => {
    if (!item || item.type !== "found" || (!isPoster && !isAdmin)) return;

    const fetchClaims = async () => {
      setClaimsLoading(true);
      try {
        const { data } = await api.get(`/claims/item/${item._id}`);
        setClaims(data.data);
      } catch (error) {
        console.error("Failed to load claims:", error);
      } finally {
        setClaimsLoading(false);
      }
    };
    fetchClaims();
  }, [item, isPoster, isAdmin]);

  const handleClaimAction = async (claimId, status) => {
    setClaimActionError("");
    try {
      await api.patch(`/claims/${claimId}`, { status });
      // refresh claims list and item (item status may have changed to "claimed")
      const [claimsRes, itemRes] = await Promise.all([
        api.get(`/claims/item/${item._id}`),
        api.get(`/items/${item._id}`),
      ]);
      setClaims(claimsRes.data.data);
      onItemUpdate(itemRes.data.data);
    } catch (error) {
      setClaimActionError(
        error.response?.data?.message || "Failed to update claim.",
      );
    }
  };

  const handleDeleteClaim = async (claimId) => {
    if (!window.confirm("Permanently delete this claim?")) return;
    try {
      await api.delete(`/claims/${claimId}`);
      setClaims((prev) => prev.filter((c) => c._id !== claimId));
    } catch (error) {
      setClaimActionError(
        error.response?.data?.message || "Failed to delete claim.",
      );
    }
  };

  return (
    <div className="mt-4 border-t border-overlay pt-4">
      <h2 className="text-xl font-semibold text-text mb-3">
        Claims on this item
      </h2>

      {claimActionError && (
        <p className="text-error mb-2">{claimActionError}</p>
      )}

      {claimsLoading && <p className="text-subtext">Loading claims...</p>}

      {!claimsLoading && claims.length === 0 && (
        <p className="text-subtext">No claims yet.</p>
      )}

      {!claimsLoading && claims.length > 0 && (
        <div className="flex flex-col gap-3">
          {claims.map((claim) => (
            <div
              key={claim._id}
              className="border border-overlay rounded-lg p-3"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-text">
                    {claim.claimantId.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      claim.status === "approved"
                        ? "bg-success/20 text-success"
                        : claim.status === "rejected"
                          ? "bg-error/20 text-error"
                          : "bg-overlay text-subtext"
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>

                {claim.answer && (
                  <p className="text-sm text-text mb-1">
                    <strong>Answer:</strong> {claim.answer}
                  </p>
                )}

                {claim.message && (
                  <p className="text-sm text-subtext mb-2">"{claim.message}"</p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-overlay/40">
                {/* Buttons for actions */}
                <div>
                  {claim.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClaimAction(claim._id, "approved")}
                        className="text-xs bg-success/20 text-success px-3 py-1 rounded-lg hover:bg-success/30 transition-colors font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleClaimAction(claim._id, "rejected")}
                        className="text-xs bg-error/20 text-error px-3 py-1 rounded-lg hover:bg-error/30 transition-colors font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
                {user.id !== claim.claimantId._id && (
                  <ReportButton
                    targetUser={claim.claimantId._id}
                    label="Report Claimant"
                  />
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteClaim(claim._id)}
                    className="text-xs text-error hover:underline"
                  >
                    Delete Claim
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClaimsReviewPanel;
