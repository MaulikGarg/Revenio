import { useState, useEffect } from "react";
import api from "../../api/axios";

const SuggestionForm = ({ item }) => {
  const [myFoundItems, setMyFoundItems] = useState([]);
  const [selectedFoundItem, setSelectedFoundItem] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMyFoundItems = async () => {
      try {
        const { data } = await api.get("/items/mine", {
          params: { type: "found" },
        });
        setMyFoundItems(data.data);
      } catch (error) {
        console.error("Failed to load your found items:", err);
      }
    };
    fetchMyFoundItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFoundItem) {
      setError("Please select one of your found items.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/suggestions", {
        lostItem: item._id,
        foundItem: selectedFoundItem,
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit suggestion.");
    } finally {
      setSubmitting(false);
    }
  };

  if (myFoundItems.length === 0) return null;
  if (success) {
    return <p className="text-success mt-4">Suggestion sent to the poster.</p>;
  }

  return (
    <div className="mt-4 border-t border-overlay pt-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue/20 text-blue hover:bg-blue/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          I found this item
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && <p className="text-error text-sm">{error}</p>}
          <label className="text-sm text-subtext">
            Which of your posts matches this?
          </label>
          <select
            value={selectedFoundItem}
            onChange={(e) => setSelectedFoundItem(e.target.value)}
            className="border border-overlay bg-surface text-text p-2 rounded-lg w-full"
          >
            <option value="">Select a found item</option>
            {myFoundItems.map((fi) => (
              <option key={fi._id} value={fi._id}>
                {fi.title}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue/20 text-blue hover:bg-blue/30 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {submitting ? "Sending..." : "Send Suggestion"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs text-subtext hover:text-text"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SuggestionForm;
