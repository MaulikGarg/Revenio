import ReportButton from "../ReportButton";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { Trash2, RotateCcw, CircleX } from "lucide-react";

const ItemActions = ({
  item,
  isPoster,
  isAdmin,
  canMarkReturned,
  onMarkReturned,
}) => {
  const navigate = useNavigate();
  const isLostType = (item) => item.type === "lost";

  const handleDeleteItem = async () => {
    if (!window.confirm("Permanently delete this item? This cannot be undone."))
      return;
    try {
      await api.delete(`/items/${item._id}`);
      navigate(isLostType(item) ? "/dashboard/lost" : "/dashboard/found");
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };
  return (
    <>
      {canMarkReturned && (
        <button
          onClick={onMarkReturned}
          className="inline-flex items-center gap-1 bg-success/20 text-success hover:bg-success/30 px-4 py-2 rounded-lg text-sm font-medium mb-4 transition-colors cursor-pointer"
        >
          <RotateCcw size={14} />
          Mark as Returned
        </button>
      )}

      {!isPoster && (
        <div className="flex gap-4 mb-4">
          <ReportButton targetItem={item._id} label="Report Item" />
          <ReportButton targetUser={item.postedBy._id} label="Report User" />
          {isAdmin && (
            <button
              onClick={handleDeleteItem}
              className="flex items-center gap-1 text-xs text-subtext hover:text-error transition-colors"
            >
              <CircleX size={14} />
              Delete Item
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default ItemActions;
