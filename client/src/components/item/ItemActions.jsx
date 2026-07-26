import ReportButton from "../ReportButton";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

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
          className="bg-success/20 text-success hover:bg-success/30 px-4 py-2 rounded-lg text-sm font-medium mb-4 transition-colors"
        >
          Mark as Returned
        </button>
      )}

      {!isPoster && (
        <div className="flex gap-4 mb-4">
          <ReportButton targetItem={item._id} label="Report Item" />
          <ReportButton targetUser={item.postedBy._id} label="Report User" />
        </div>
      )}

      {isAdmin && (
        <button
          onClick={handleDeleteItem}
          className="text-xs text-error hover:underline mb-4"
        >
          Delete Item
        </button>
      )}
    </>
  );
};

export default ItemActions;
