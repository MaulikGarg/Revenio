import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PageContainer from "../components/PageContainer";
import ClaimsReviewPanel from "../components/item/ClaimsReviewPanel";
import ClaimForm from "../components/item/ClaimForm";
import MyClaimHistory from "../components/item/MyClaimHistory";
import ItemHeader from "../components/item/ItemHeader";
import ItemActions from "../components/item/ItemActions";

export const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [myClaims, setMyClaims] = useState([]);
  const [myClaimsLoading, setMyClaimsLoading] = useState(false);

  const isFound = item?.type === "found";
  const isPoster = item?.postedBy._id === user.id;
  const isAdmin = user.role === "admin";
  const hasPendingClaim = myClaims.some((c) => c.status === "pending");
  const canClaim =
    item?.status === "active" &&
    isFound &&
    !isPoster &&
    !isAdmin &&
    !hasPendingClaim;
  const hasApprovedClaim = myClaims.some((c) => c.status === "approved");
  const canMarkReturned =
    item?.status === "claimed" && (isPoster || isAdmin || hasApprovedClaim);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const { data } = await api.get(`/items/${id}`);
        setItem(data.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load item.");
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const fetchMyClaims = async () => {
    if (!item) return;
    setMyClaimsLoading(true);
    try {
      const { data } = await api.get(`/claims/item/${item._id}`);
      setMyClaims(data.data);
    } catch (error) {
      console.error("Failed to load your claims:", error);
    } finally {
      setMyClaimsLoading(false);
    }
  };

  useEffect(() => {
    if (!item || isPoster || !isFound) return;
    fetchMyClaims();
  }, [item, isPoster, isFound]);

  if (loading) return <p className="m-8 flex justify-center ">Loading...</p>;
  if (error) return <p className="m-8 text-error">{error}</p>;
  if (!item) return null;

  const handleMarkReturned = async () => {
    try {
      const { data } = await api.patch(`/items/${item._id}/status`, {
        status: "returned",
      });
      setItem(data.data);
    } catch (error) {
      console.error("Failed to mark as returned:", error);
    }
  };

  return (
    <PageContainer maxWidth="max-w-xl" className="mt-10">
      <div className="bg-surface border border-overlay rounded-lg p-6 shadow-sm ">
        <ItemHeader
          item={item}
          showFullDescription={showFullDescription}
          onToggleDescription={() =>
            setShowFullDescription(!showFullDescription)
          }
        />
        <ItemActions
          item={item}
          isPoster={isPoster}
          canMarkReturned={canMarkReturned}
          onMarkReturned={handleMarkReturned}
        />

        {(isPoster || isAdmin) && isFound && (
          <ClaimsReviewPanel item={item} onItemUpdate={setItem} />
        )}

        {!isPoster && !isAdmin && item.status !== "active" && (
          <p className="text-error">This item is already {item.status}.</p>
        )}

        {canClaim && !myClaimsLoading && (
          <ClaimForm item={item} onClaimSubmitted={fetchMyClaims} />
        )}

        {!isPoster && myClaims.length > 0 && (
          <MyClaimHistory claims={myClaims} isAdmin={isAdmin} />
        )}
      </div>
    </PageContainer>
  );
};

export default ItemDetail;
