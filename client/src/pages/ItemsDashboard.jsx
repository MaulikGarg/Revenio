import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import PageContainer from "../components/PageContainer";

import {
  IdCard,
  Droplet,
  Laptop,
  BookOpen,
  Backpack,
  Package,
  Search,
  Plus,
} from "lucide-react";

const CATEGORY_ICONS = {
  "ID Card": IdCard,
  Bottle: Droplet,
  Electronics: Laptop,
  Book: BookOpen,
  Bag: Backpack,
  Other: Package,
};
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
  const postLink = isLost ? "/post-lost" : "/post-found";
  const postLabel = isLost ? "Post Lost Item" : "Post Found Item";

  return (
    <PageContainer maxWidth="max-w-6xl" className="py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-4xl font-heading text-text">{title}</h1>
        <Link
          to={postLink}
          className="flex items-center justify-center gap-1 bg-accent-500 text-white hover:bg-accent-600 px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto"
        >
          <Plus size={16} />
          {postLabel}
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext pointer-events-none"
          />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-overlay bg-surface text-text placeholder-subtext p-2 pl-9 rounded-lg w-full transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-overlay bg-surface text-text p-2 rounded-lg sm:w-48 transition focus:outline-none focus:border-accent-600 focus:ring-1 focus:ring-accent-500"
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
              className="bg-surface border border-overlay rounded-lg p-4 transition hover:outline-none hover:border-accent-600 hover:ring-1 hover:ring-accent-500"
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
                  {(() => {
                    const Icon = CATEGORY_ICONS[item.category] || Package;
                    return (
                      <span className="flex items-center gap-1 bg-overlay text-text text-xs px-2 py-0.5 rounded-full">
                        <Icon size={12} />
                        {item.category}
                      </span>
                    );
                  })()}
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
    </PageContainer>
  );
};

export default ItemsDashboard;
