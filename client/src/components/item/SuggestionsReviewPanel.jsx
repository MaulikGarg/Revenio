import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const SuggestionsReviewPanel = ({ item }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/suggestions/lost/${item._id}`);
        setSuggestions(data.data);
      } catch (error) {
        console.error("Failed to load suggestions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [item._id]);

  const handleDismiss = async (suggestionId) => {
    try {
      await api.patch(`/suggestions/${suggestionId}/dismiss`);
    } catch (error) {
      console.error("Failed to dismiss suggestion:", error);
    }
  };

  return (
    <div className="mt-4 border-t border-overlay pt-4">
      <h2 className="text-lg font-semibold text-text mb-2">
        People think they found this
      </h2>

      {loading && <p className="text-subtext">Loading...</p>}
      {!loading && suggestions.length === 0 && (
        <p className="text-subtext">No suggestions yet.</p>
      )}

      {!loading &&
        suggestions.map((s) => (
          <div
            key={s._id}
            className="border border-overlay rounded-lg p-3 mb-2"
          >
            <p className="text-text font-medium mb-1">{s.foundItem.title}</p>
            <p className="text-sm text-subtext mb-2 line-clamp-2">
              {s.foundItem.description}
            </p>
            <div className="flex gap-2">
              <Link
                to={`/item/${s.foundItem._id}`}
                className="text-xs bg-blue/20 text-blue px-3 py-1 rounded-lg hover:bg-blue/30 transition-colors"
              >
                View & Claim if yours
              </Link>
              <button
                onClick={() => handleDismiss(s._id)}
                className="text-xs text-subtext hover:text-error transition-colors"
              >
                Not mine
              </button>
            </div>
          </div>
        ))}
    </div>
  );
};

export default SuggestionsReviewPanel;
