const MyClaimHistory = ({ claims, isAdmin }) => {
  return (
    <div className="mt-4 border-t border-overlay pt-4">
      <h2 className="text-lg font-semibold text-text mb-2">
        {isAdmin ? "Claim History" : "Your claim history"}
      </h2>
      <div className="flex flex-col gap-2">
        {claims.map((c) => (
          <div key={c._id} className="border border-overlay rounded-lg p-3">
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
  );
};

export default MyClaimHistory;
