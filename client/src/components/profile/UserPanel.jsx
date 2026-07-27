import { useState, useEffect } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Lightbulb, Flag, MessageCircle } from "lucide-react";

const UserPanel = () => {
  const [activeTab, setActiveTab] = useState("claims");
  const [claims, setClaims] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [directionFilter, setDirectionFilter] = useState("all"); // "all" | "incoming" | "outgoing"

  const navigate = useNavigate();
  const openChat = (type, id) => navigate(`/messages/${type}/${id}`);
  const filteredClaims = claims.filter(
    (c) => directionFilter === "all" || c.direction === directionFilter,
  );
  const filteredSuggestions = suggestions.filter(
    (s) => directionFilter === "all" || s.direction === directionFilter,
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "claims") {
          const { data } = await api.get("/claims/mine");
          setClaims(data.data);
        } else if (activeTab === "suggestions") {
          const { data } = await api.get("/suggestions/mine");
          setSuggestions(data.data);
        } else if (activeTab === "reports") {
          const { data } = await api.get("/reports/mine");
          setReports(data.data);
        }
      } catch (error) {
        console.error(`Failed to load ${activeTab}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab]);

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-overlay">
        <button
          onClick={() => setActiveTab("claims")}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "claims"
              ? "border-accent-500 text-accent-500"
              : "border-transparent text-subtext hover:text-text"
          }`}
        >
          <FileText size={16} />
          Your Claims
        </button>
        <button
          onClick={() => setActiveTab("suggestions")}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "suggestions"
              ? "border-accent-500 text-accent-500"
              : "border-transparent text-subtext hover:text-text"
          }`}
        >
          <Lightbulb size={16} />
          Your Suggestions
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`cursor-pointer flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "reports"
              ? "border-accent-500 text-accent-500"
              : "border-transparent text-subtext hover:text-text"
          }`}
        >
          <Flag size={16} />
          Your Reports
        </button>
      </div>
      {(activeTab === "claims" || activeTab === "suggestions") && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setDirectionFilter("all")}
            className={`cursor-pointer text-xs px-3 py-1 rounded-lg transition-colors ${
              directionFilter === "all"
                ? "bg-accent-500/20 text-accent-500 font-medium"
                : "text-subtext hover:bg-overlay"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setDirectionFilter("incoming")}
            className={`cursor-pointer text-xs px-3 py-1 rounded-lg transition-colors ${
              directionFilter === "incoming"
                ? "bg-teal/20 text-teal font-medium"
                : "text-subtext hover:bg-overlay"
            }`}
          >
            Incoming
          </button>
          <button
            onClick={() => setDirectionFilter("outgoing")}
            className={`cursor-pointer text-xs px-3 py-1 rounded-lg transition-colors ${
              directionFilter === "outgoing"
                ? "bg-blue/20 text-blue font-medium"
                : "text-subtext hover:bg-overlay"
            }`}
          >
            Outgoing
          </button>
        </div>
      )}

      {loading && <p className="text-subtext">Loading...</p>}

      {!loading && activeTab === "claims" && (
        <div className="flex flex-col gap-2">
          {claims.length === 0 && (
            <p className="text-subtext">No claims yet.</p>
          )}
          {claims.map((c) => (
            <div
              key={c._id}
              className="border border-overlay rounded-lg p-3 hover:border-accent-500 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <Link
                  to={c.itemId ? `/item/${c.itemId._id}` : "#"}
                  className="flex-1 min-w-0"
                >
                  <span className="text-xs text-subtext">
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </span>
                  {c.answer && (
                    <p className="text-sm text-text mt-1">{c.answer}</p>
                  )}
                </Link>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div>
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
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ml-1 ${
                        c.direction === "incoming"
                          ? "bg-teal/20 text-teal"
                          : "bg-blue/20 text-blue"
                      }`}
                    >
                      {c.direction === "incoming" ? "Incoming" : "Outgoing"}
                    </span>
                  </div>

                  <button
                    onClick={() => openChat("claim", c._id)}
                    className="cursor-pointer flex items-center gap-1 text-xs text-subtext hover:text-accent-500 hover:bg-overlay px-2 py-1 rounded-lg transition-colors"
                  >
                    <MessageCircle size={12} />
                    Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && activeTab === "suggestions" && (
        <div className="flex flex-col gap-2">
          {filteredSuggestions.length === 0 && (
            <p className="text-subtext">No suggestions yet.</p>
          )}
          {filteredSuggestions.map((s) => (
            <div key={s._id} className="border border-overlay rounded-lg p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-subtext">
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        s.status === "dismissed"
                          ? "bg-overlay text-subtext"
                          : "bg-accent-500/20 text-accent-500"
                      }`}
                    >
                      {s.status}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ml-1 ${
                        s.direction === "incoming"
                          ? "bg-teal/20 text-teal"
                          : "bg-blue/20 text-blue"
                      }`}
                    >
                      {s.direction === "incoming" ? "Incoming" : "Outgoing"}
                    </span>
                  </div>

                  <button
                    onClick={() => openChat("suggestion", s._id)}
                    className="cursor-pointer flex items-center gap-1 text-xs text-subtext hover:text-accent-500 hover:bg-overlay px-2 py-1 rounded-lg transition-colors"
                  >
                    <MessageCircle size={12} />
                    Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && activeTab === "reports" && (
        <div className="flex flex-col gap-2">
          {reports.length === 0 && (
            <p className="text-subtext">No reports yet.</p>
          )}
          {reports.map((r) => (
            <div key={r._id} className="border border-overlay rounded-lg p-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text">{r.reason}</span>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      r.status === "reviewed"
                        ? "bg-success/20 text-success"
                        : r.status === "dismissed"
                          ? "bg-overlay text-subtext"
                          : "bg-accent-500/20 text-accent-500"
                    }`}
                  >
                    {r.status}
                  </span>

                  <button
                    onClick={() => openChat("report", r._id)}
                    className="cursor-pointer flex items-center gap-1 text-xs text-subtext hover:text-accent-500 hover:bg-overlay px-2 py-1 rounded-lg transition-colors"
                  >
                    <MessageCircle size={12} />
                    Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPanel;
