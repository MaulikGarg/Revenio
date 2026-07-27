import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Send } from "lucide-react";

const ClaimForm = ({ item, onClaimSubmitted }) => {
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [myLostItems, setMyLostItems] = useState([]);
  const [linkedLostItem, setLinkedLostItem] = useState("");

  useEffect(() => {
    const fetchMyLostItems = async () => {
      try {
        const { data } = await api.get("/items/mine", {
          params: { type: "lost" },
        });
        setMyLostItems(data.data);
      } catch (error) {
        console.error("Failed to load your lost items:", error);
      }
    };
    fetchMyLostItems();
  }, []);

  const handleClaimSubmit = async (i) => {
    i.preventDefault();
    setClaimError("");
    setClaimSubmitting(true);

    try {
      await api.post("/claims", {
        itemId: item._id,
        answer,
        message,
        linkedLostItem: linkedLostItem || null,
      });
      setClaimSuccess(true);
      onClaimSubmitted();
    } catch (error) {
      setClaimError(error.response?.data?.message || "Failed to submit claim.");
    } finally {
      setClaimSubmitting(false);
    }
  };
  return !claimSuccess ? (
    <form
      onSubmit={handleClaimSubmit}
      className="flex flex-col gap-3 mt-4 border-t border-overlay pt-4"
    >
      <h2 className="text-xl font-semibold text-text">Claim this item</h2>
      {claimError && <p className="text-error">{claimError}</p>}

      {/* Item claim question */}
      {item.claimQuestion && (
        <div>
          <p className="mb-1 font-medium text-text">{item.claimQuestion}</p>
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

      {myLostItems.length > 0 && (
        <div>
          <label className="text-sm text-subtext mb-1 block">
            Is this the item you reported lost? (optional)
          </label>
          <select
            value={linkedLostItem}
            onChange={(e) => setLinkedLostItem(e.target.value)}
            className="border border-overlay bg-surface text-text p-2 rounded-lg w-full"
          >
            <option value="">Don't link a lost post</option>
            {myLostItems.map((li) => (
              <option key={li._id} value={li._id}>
                {li.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        type="submit"
        disabled={claimSubmitting}
        className="self-center inline-flex items-center gap-1 bg-accent-500 text-white hover:bg-accent-600 p-2 rounded-lg disabled:opacity-50"
      >
        <Send size={14} />
        {claimSubmitting ? "Submitting..." : "Submit Claim"}
      </button>
    </form>
  ) : (
    <p className="text-success mt-4">
      Claim submitted! The poster will review it.
    </p>
  );
};

export default ClaimForm;
