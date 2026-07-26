import ReportButton from "../ReportButton";

const ItemActions = ({ item, isPoster, canMarkReturned, onMarkReturned }) => {
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
    </>
  );
};

export default ItemActions;
