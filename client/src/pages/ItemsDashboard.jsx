import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const CATEGORIES = ["ID Card", "Bottle", "Electronics", "Book", "Bag", "Other"];

export const ItemsDashboard = ({ type = "lost" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // display search
  const [searchQuery, setSearchQuery] = useState("");
  // actual search item used interanally for api call
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer); // cancel previous timer if user types again before it fires
  }, [searchQuery]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/items", {
          params: {
            type,
            q: debouncedSearch || undefined,
            category: category || undefined,
          },
        });
        setItems(data.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load items.");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type, debouncedSearch, category]);

  const isLost = type === "lost";
  const title = isLost ? "Lost Items" : "Found Items";
  const placeholder = isLost ? "Search lost items..." : "Search found items...";
  const emptyMessage = isLost
    ? "No lost items found."
    : "No found items listed.";

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <h1 className="text-4xl font-heading text-text mb-6">{title}</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-overlay bg-surface text-text placeholder-subtext p-2 rounded-lg flex-1"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-overlay bg-surface text-text p-2 rounded-lg sm:w-48"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-subtext text-center mt-10">Loading...</p>}
      {error && <p className="text-error text-center mt-10">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-subtext text-center mt-10">{emptyMessage}</p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Link
              key={item._id}
              to={`/item/${item._id}`}
              className="bg-surface border border-overlay rounded-lg p-4 hover:border-accent-500 transition-colors"
            >
              {item.photoUrl && (
                <img
                  src={item.photoUrl}
                  alt={item.title}
                  className="mb-3 rounded-md h-32 w-full object-cover border border-overlay"
                />
              )}

              <h2 className="text-lg font-semibold text-text mb-1">
                {item.title}
              </h2>

              <div className="flex items-center gap-2 mb-2">
                <span className="bg-overlay text-text text-xs px-2 py-0.5 rounded-full">
                  {item.category}
                </span>
                <span className="text-xs text-subtext">{item.status}</span>
              </div>

              <p className="text-sm text-subtext line-clamp-2 mb-2">
                {item.description}
              </p>

              <p className="text-xs text-subtext">
                {item.location} · {new Date(item.date).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemsDashboard;
