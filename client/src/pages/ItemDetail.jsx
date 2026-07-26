// describes the page for a single item
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageContainer from "../components/PageContainer";
import ReportButton from "../components/ReportButton";

const STATUS_COLORS = {
  active: "text-teal",
  claimed: "text-yellow",
  returned: "text-subtext",
};

export const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);

  // handling claim button
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState(false);

  // handle claims
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimActionError, setClaimActionError] = useState("");
  const [myClaims, setMyClaims] = useState([]);
  const [myClaimsLoading, setMyClaimsLoading] = useState(false);

  // can only claim found items
  const isFound = item?.type === "found";
  const isPoster = item?.postedBy._id === user.id;
  const isAdmin = user.role === "admin";
  const hasPendingClaim = myClaims.some((c) => c.status === "pending");
  const canClaim =
    item?.status === "active" &&
    isFound &&
    !isPoster &&
    !isAdmin &&
    !hasPendingClaim;
  const hasApprovedClaim = myClaims.some((c) => c.status === "approved");
  const canMarkReturned =
    item?.status === "claimed" && (isPoster || isAdmin || hasApprovedClaim);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/items/${id}`);
        setItem(data.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load item.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

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

  useEffect(() => {
    if (!item || isPoster || !isFound) return;

    const fetchMyClaims = async () => {
      setMyClaimsLoading(true);
      try {
        const { data } = await api.get(`/claims/item/${item._id}`);
        setMyClaims(data.data);
      } catch (error) {
        console.error("Failed to load your claims:", error);
      } finally {
        setMyClaimsLoading(false);
      }
    };
    fetchMyClaims();
  }, [item, isPoster, isFound]);

  if (loading) return <p className="m-8 flex justify-center ">Loading...</p>;
  if (error) return <p className="m-8 text-error">{error}</p>;
  if (!item) return null;

  // if user clicks claim button
  const handleClaimSubmit = async (i) => {
    i.preventDefault();
    setClaimError("");
    setClaimSubmitting(true);

    try {
      await api.post("/claims", {
        itemId: item._id,
        answer,
        message,
      });
      setClaimSuccess(true);
      const { data } = await api.get(`/claims/item/${item._id}`);
      setMyClaims(data.data);
    } catch (error) {
      setClaimError(error.response?.data?.message || "Failed to submit claim.");
    } finally {
      setClaimSubmitting(false);
    }
  };

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
      setItem(itemRes.data.data);
    } catch (error) {
      setClaimActionError(
        error.response?.data?.message || "Failed to update claim.",
      );
    }
  };

  const handleMarkReturned = async () => {
    setClaimActionError("");
    try {
      const { data } = await api.patch(`/items/${item._id}/status`, {
        status: "returned",
      });
      setItem(data.data);
    } catch (error) {
      setClaimActionError(
        error.response?.data?.message || "Failed to mark as returned.",
      );
    }
  };

  return (
    <PageContainer maxWidth="max-w-xl" className="mt-10">
      <div className="bg-surface border border-overlay rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-heading mb-2 text-text">{item.title}</h1>
        <p className="text-sm text-subtext mb-4">
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${item.type === "lost" ? "bg-peach/20 text-peach" : "bg-blue/20 text-blue"}`}
          >
            {item.type === "lost" ? "Lost" : "Found"}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ml-1 ${STATUS_COLORS[item.status] || "bg-overlay text-subtext"}`}
          >
            {item.status}
          </span>
        </p>
        {item.photoUrl && (
          <img
            src={item.photoUrl}
            alt={item.title}
            className="mb-4 rounded-md max-h-64 w-full object-cover border border-overlay"
          />
        )}
        <p
          className={`mb-2 text-text ${showFullDescription ? "" : "line-clamp-2"}`}
        >
          {item.description}
        </p>
        {item.description.length > 120 && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-sm text-accent-500 hover:underline mb-2"
          >
            {showFullDescription ? "Show less" : "Show more"}
          </button>
        )}
        <p className="mb-1 text-text">
          <strong>Category:</strong> {item.category}
        </p>
        <p className="mb-1 text-text">
          <strong>Location:</strong> {item.location}
        </p>
        <p className="mb-1 text-text">
          <strong>Date:</strong> {new Date(item.date).toLocaleDateString()}
        </p>
        {item.tags?.length > 0 && (
          <p className="mb-1 text-text">
            <strong>Tags:</strong> {item.tags.join(", ")}
          </p>
        )}
        <p className="mb-4 text-sm text-subtext">
          Posted by {item.postedBy.name}
        </p>

        {canMarkReturned && (
          <button
            onClick={handleMarkReturned}
            className="bg-success/20 text-success hover:bg-success/30 px-4 py-2 rounded-lg text-sm font-medium mb-4 transition-colors"
          >
            Mark as Returned
          </button>
        )}

        {!isPoster && (
          <div className="flex gap-4 mb-4">
            <ReportButton targetItem={item._id} label="Report Item" />
            <ReportButton targetUser={item.postedBy._id} label="Report User" />
          </div>
        )}

        {/* if user is poster/admin or if item claimed */}
        {(isPoster || isAdmin) && isFound && (
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
                        <p className="text-sm text-subtext mb-2">
                          "{claim.message}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-overlay/40">
                      {/* Buttons for actions */}
                      <div>
                        {claim.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handleClaimAction(claim._id, "approved")
                              }
                              className="text-xs bg-success/20 text-success px-3 py-1 rounded-lg hover:bg-success/30 transition-colors font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleClaimAction(claim._id, "rejected")
                              }
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* if item is already claimed */}
        {!isPoster && !isAdmin && item.status !== "active" && (
          <p className="text-error">This item is already {item.status}.</p>
        )}

        {canClaim && !myClaimsLoading && !claimSuccess && (
          <form
            onSubmit={handleClaimSubmit}
            className="flex flex-col gap-3 mt-4 border-t border-overlay pt-4"
          >
            <h2 className="text-xl font-semibold text-text">Claim this item</h2>
            {claimError && <p className="text-error">{claimError}</p>}

            {/* Item claim question */}
            {item.claimQuestion && (
              <div>
                <p className="mb-1 font-medium text-text">
                  {item.claimQuestion}
                </p>
                <input
                  type="text"
                  placeholder="Your answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  required
                  className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg w-full"
                />
              </div>
            )}

            <textarea
              placeholder="Optional message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg w-full"
            />

            <button
              type="submit"
              disabled={claimSubmitting}
              className="bg-accent-500 text-white hover:bg-accent-600 p-2 rounded-lg disabled:opacity-50"
            >
              {claimSubmitting ? "Submitting..." : "Submit Claim"}
            </button>
          </form>
        )}
        {claimSuccess && (
          <p className="text-success mt-4">
            Claim submitted! The poster will review it.
          </p>
        )}
        {!isPoster && myClaims.length > 0 && (
          <div className="mt-4 border-t border-overlay pt-4">
            <h2 className="text-lg font-semibold text-text mb-2">
              {isAdmin ? "Claim History" : "Your claim history"}
            </h2>
            <div className="flex flex-col gap-2">
              {myClaims.map((c) => (
                <div
                  key={c._id}
                  className="border border-overlay rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-subtext">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        c.status === "approved"
                          ? "bg-success/20 text-success"
                          : c.status === "rejected"
                            ? "bg-error/20 text-error"
                            : "bg-overlay text-subtext"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  {c.answer && <p className="text-sm text-text">{c.answer}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default ItemDetail;
