const STATUS_COLORS = {
  active: "text-teal",
  claimed: "text-yellow",
  returned: "text-subtext",
};
const ItemHeader = ({ item, showFullDescription, onToggleDescription }) => {
  return (
    <>
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
        className={`mb-2 text-text wrap-break-word ${showFullDescription ? "" : "line-clamp-2"}`}
      >
        {item.description}
      </p>
      {item.description.length > 120 && (
        <button
          onClick={onToggleDescription}
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
    </>
  );
};

export default ItemHeader;
