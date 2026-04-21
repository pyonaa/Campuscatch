import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Calendar, Maximize2, Edit, Trash2, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";
import { formatLocation, getTimeAgo, getInitials } from "../lib/utils";
import { toast } from "sonner";
import ImageLightbox from "../components/ImageLightbox";

interface Item {
  id: string;
  name: string;
  category: string;
  location: string;
  dateFound: string;
  description: string;
  status: string;
  imageUrls?: string[];
  userId: string;
  userName: string;
  createdAt: string;
  claimedBy?: string;
  claimedByUserId?: string;
  ownerWants?: string;
  ownerWantsNotes?: string;
  acceptedOfferId?: string;
}

export default function ItemDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [auctionData, setAuctionData] = useState({ ownerWants: "", ownerWantsNotes: "" });

  useEffect(() => { fetchItem(); }, [id]);

  useEffect(() => {
    const handleItemUpdated = () => fetchItem();
    window.addEventListener("itemUpdated", handleItemUpdated);
    return () => window.removeEventListener("itemUpdated", handleItemUpdated);
  }, [id]);

  const fetchItem = async () => {
    try {
      setIsLoading(true);
      if (id) {
        const data = await mockApi.getItem(id);
        setItem(data);
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await mockApi.deleteItem(id);
      toast.success("Item deleted successfully");
      navigate("/home");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleUnclaimedAction = async (action: "keep" | "auction" | "archive") => {
    if (!id) return;
    if (action === "auction") { setShowAuctionModal(true); return; }
    try {
      await mockApi.handleUnclaimedAction(id, action);
      window.dispatchEvent(new Event("itemUpdated"));
      window.dispatchEvent(new Event("notificationsUpdated"));
      if (action === "keep") { toast.success("Item will remain in CampusCatch"); fetchItem(); }
      else { toast.success("Item archived to CampusVault"); setTimeout(() => navigate("/my-items"), 1500); }
    } catch {
      toast.error("Failed to process action");
    }
  };

  const handleSubmitAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await mockApi.handleUnclaimedAction(id, "auction", {
        ownerWants: auctionData.ownerWants,
        ownerWantsNotes: auctionData.ownerWantsNotes,
      });
      window.dispatchEvent(new Event("itemUpdated"));
      window.dispatchEvent(new Event("notificationsUpdated"));
      setShowAuctionModal(false);
      toast.success("Item moved to CampusAuction");
      fetchItem();
      setTimeout(() => navigate("/auction"), 1500);
    } catch {
      toast.error("Failed to move item to auction");
    }
  };

  const isUnclaimedFor2Months = (createdAt: string) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return diffMs / (1000 * 60 * 60 * 24 * 30) >= 2;
  };

  const itemImages = item?.imageUrls || [];
  const isOwner = item?.userId === user?.id || item?.userId === "mock-user-id";
  const showUnclaimedAlert = item && isOwner && item.status === "Available" && isUnclaimedFor2Months(item.createdAt);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available": return "badge-available";
      case "Pending": return "badge-pending";
      case "Returned": return "badge-returned";
      case "Auction": return "badge-auction";
      case "Completed": return "badge-completed";
      default: return "badge-returned";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--poke-text-muted)]">Loading...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4 text-[var(--poke-text)]">Item not found</h2>
          <button onClick={() => navigate("/home")} className="btn-poke-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <header className="navbar-poke sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/home")} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl text-white font-bold tracking-wide">Item Details</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="card-poke overflow-hidden">
          {/* Image */}
          <div className="relative aspect-video w-full overflow-hidden bg-[#1a237e]">
            <img
              src={itemImages[0] || "https://via.placeholder.com/800x600/1a237e/ffffff?text=No+Image"}
              alt={item.name}
              className="w-full h-full object-cover opacity-90"
            />
            {itemImages.length > 0 && (
              <button
                onClick={() => { setLightboxIndex(0); setShowLightbox(true); }}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70 transition-colors"
              >
                <Maximize2 size={20} />
              </button>
            )}
            {itemImages.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-lg text-sm">
                {itemImages.length} photos
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {itemImages.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-[var(--poke-surface-2)]">
              {itemImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${item.name} ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity border-2 border-transparent hover:border-[var(--poke-blue-light)]"
                  onClick={() => { setLightboxIndex(index); setShowLightbox(true); }}
                />
              ))}
            </div>
          )}

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--poke-text)]">{item.name}</h2>
              <span className={getStatusBadge(item.status)}>{item.status}</span>
            </div>

            {/* Poster */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--poke-border)]">
              <button
                onClick={() => navigate(`/profile/${item.userId}`)}
                className="flex items-center gap-3 hover:bg-[var(--poke-surface-2)] p-2 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #1565C0, #0D47A1)" }}>
                  {getInitials(item.userName)}
                </div>
                <div className="text-left">
                  <p className="text-xs text-[var(--poke-text-muted)]">Posted by</p>
                  <p className="font-semibold text-[var(--poke-text)]">{item.userName}</p>
                </div>
              </button>
              {!isOwner && (
                <button
                  onClick={() => navigate(`/messages/${id}`)}
                  className="ml-auto p-2 text-[var(--poke-blue-light)] hover:bg-[var(--poke-surface-2)] rounded-lg transition-colors"
                  title="Send message"
                >
                  <MessageCircle size={20} />
                </button>
              )}
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-[var(--poke-text-muted)]">
                <MapPin size={16} className="text-[var(--poke-blue-light)]" />
                <span>{formatLocation(item.location)}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--poke-text-muted)]">
                <Calendar size={16} className="text-[var(--poke-blue-light)]" />
                <span>Found on {item.dateFound}</span>
              </div>
              <p className="text-xs text-[var(--poke-text-dim)]">Posted {getTimeAgo(item.createdAt)}</p>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-[var(--poke-text-muted)] uppercase tracking-wider mb-2">Description</h3>
              <p className="text-[var(--poke-text)] leading-relaxed">{item.description}</p>
            </div>

            {/* Returned to */}
            {item.status === "Returned" && item.claimedBy && (
              <div className="mb-6 card-poke-info p-4 rounded-xl">
                <p className="text-xs font-bold text-[var(--poke-blue-light)] uppercase tracking-wider mb-2">Returned to</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #1565C0, #0D47A1)" }}>
                    {getInitials(item.claimedBy)}
                  </div>
                  <span className="text-[var(--poke-text)] font-semibold">{item.claimedBy}</span>
                </div>
              </div>
            )}

            {/* Unclaimed alert */}
            {showUnclaimedAlert && (
              <div className="mb-6 p-4 rounded-xl border border-[rgba(255,152,0,0.3)] bg-[rgba(255,152,0,0.1)]">
                <p className="text-[#ffb74d] mb-3 text-sm font-semibold">
                  ⏰ This item has been unclaimed for 2 months. What would you like to do?
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button onClick={() => handleUnclaimedAction("keep")} className="flex-1 btn-poke-secondary text-sm py-2">
                    Keep in CampusCatch
                  </button>
                  <button onClick={() => handleUnclaimedAction("auction")} className="flex-1 btn-poke-primary text-sm py-2">
                    Move to Auction
                  </button>
                  <button onClick={() => handleUnclaimedAction("archive")} className="flex-1 btn-poke-danger text-sm py-2">
                    Archive (Vault)
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {isOwner ? (
              <div className="space-y-3">
                <div className="card-poke-info p-3 rounded-xl text-center text-sm text-[var(--poke-blue-light)] font-semibold">
                  You posted this item
                </div>
                {item.status === "Pending" && (
                  <div className="p-3 rounded-xl text-center text-sm font-semibold border border-[rgba(255,152,0,0.3)] bg-[rgba(255,152,0,0.1)] text-[#ffb74d]">
                    Someone claimed this — check Notifications to review.
                  </div>
                )}
                {item.status !== "Returned" && item.status !== "Auction" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/edit-item/${id}`)}
                      className="flex-1 btn-poke-secondary flex items-center justify-center gap-2 py-3"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex-1 btn-poke-danger flex items-center justify-center gap-2 py-3"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {item.status === "Available" && (
                  <button onClick={() => navigate(`/claim/${id}`)} className="w-full btn-poke-primary py-3">
                    This is mine — Claim it
                  </button>
                )}
                {item.status === "Pending" && (
                  <div className="w-full p-3 rounded-xl text-center text-sm font-semibold border border-[rgba(255,152,0,0.3)] bg-[rgba(255,152,0,0.1)] text-[#ffb74d]">
                    A claim is pending verification
                  </div>
                )}
                {item.status === "Returned" && (
                  <div className="w-full p-3 rounded-xl text-center text-sm font-semibold card-poke-info text-[var(--poke-blue-light)]">
                    This item has been returned to its owner
                  </div>
                )}
                {item.status === "Auction" && (
                  <div className="w-full p-3 rounded-xl text-center text-sm font-semibold border border-[rgba(206,147,216,0.3)] bg-[rgba(206,147,216,0.1)] text-[#ce93d8]">
                    This item is in CampusAuction
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <ImageLightbox
          images={itemImages}
          currentIndex={lightboxIndex}
          onClose={() => setShowLightbox(false)}
          onNavigate={setLightboxIndex}
        />
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card-poke p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[var(--poke-text)] mb-3">Delete Item</h3>
            <p className="text-[var(--poke-text-muted)] mb-6 text-sm">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 btn-poke-secondary py-2">
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 btn-poke-danger py-2">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auction modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="card-poke p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[var(--poke-text)] mb-2">Move to CampusAuction</h3>
            <p className="text-[var(--poke-text-muted)] text-sm mb-4">What would you like in exchange?</p>
            <form onSubmit={handleSubmitAuction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--poke-text-muted)] uppercase tracking-wider mb-2">
                  What do you want? <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={auctionData.ownerWants}
                  onChange={(e) => setAuctionData({ ...auctionData, ownerWants: e.target.value })}
                  className="input-poke"
                  placeholder="e.g., coffee, donuts, snacks"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--poke-text-muted)] uppercase tracking-wider mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={auctionData.ownerWantsNotes}
                  onChange={(e) => setAuctionData({ ...auctionData, ownerWantsNotes: e.target.value })}
                  className="input-poke resize-none"
                  rows={3}
                  placeholder="Any preferences..."
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAuctionModal(false)} className="flex-1 btn-poke-secondary py-2">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-poke-primary py-2">
                  Move to Auction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
