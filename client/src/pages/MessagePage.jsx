import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PageContainer from "../components/PageContainer";
import { ArrowLeft, Send } from "lucide-react";

const MessagePage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/messages/${type}/${id}`);
      setMessages(data.data);
    } catch (error) {
      setError(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [type, id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      const payload = { body };
      if (type === "claim") payload.attachedClaim = id;
      if (type === "suggestion") payload.attachedSuggestion = id;
      if (type === "report") payload.attachedReport = id;
      await api.post("/messages", payload);
      setBody("");
      await fetchMessages();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return <p className="m-8 text-center text-subtext">Loading...</p>;

  return (
    <PageContainer maxWidth="max-w-2xl" className="py-6">
      <div className="bg-surface border border-overlay rounded-lg p-4 flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3">
          {error && <p className="text-error text-sm">{error}</p>}
          {messages.length === 0 && (
            <p className="text-subtext text-sm text-center mt-8">
              No messages yet. Say hello.
            </p>
          )}
          {messages.map((m) => {
            const isMine = m.senderId?._id === user.id;
            return (
              <div
                key={m._id}
                className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  isMine
                    ? "bg-accent-500 text-white self-end"
                    : "bg-overlay text-text self-start"
                }`}
              >
                <p className="text-xs opacity-70 mb-0.5">
                  {m.senderId?.name || "Unknown"}
                </p>
                <p>{m.body}</p>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-overlay bg-canvas text-text placeholder-subtext p-2 rounded-lg"
          />
          <button
            type="submit"
            disabled={sending || !body.trim()}
            className="bg-accent-500 text-white hover:bg-accent-600 px-3 py-2 rounded-lg disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </PageContainer>
  );
};

export default MessagePage;
