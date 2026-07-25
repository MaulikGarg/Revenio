// describes the page for a single item
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

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
    } catch (error) {
      setClaimError(error.response?.data?.message || "Failed to submit claim.");
    } finally {
      setClaimSubmitting(false);
    }
  };

  // can only claim found items
  const isFound = item.type === "found";
  const isPoster = item.postedBy._id === user.id;
  const canClaim = item.status === "active" && isFound && !isPoster;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-surface border border-overlay rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-heading mb-2 text-text">{item.title}</h1>
        <p className="text-sm text-subtext mb-4">
          <span className="bg-overlay text-text text-xs px-2 py-0.5 rounded-full">
            {item.type === "lost" ? "Lost" : "Found"} · {item.status}
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

        {/* if user is poster or if item claimed */}
        {isPoster && <p className="text-accent-500">This is your own post.</p>}
        {!isPoster && item.status !== "active" && (
          <p className="text-subtext">This item is already {item.status}.</p>
        )}

        {canClaim && !claimSuccess && (
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
      </div>
    </div>
  );
};

export default ItemDetail;
