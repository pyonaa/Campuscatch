import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Calendar, Maximize2, Edit, Trash2, MessageCircle, Clock, Gavel, Archive, CheckCircle } from "lucide-react";
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
    const handler = () => fetchItem();
    window.addEventListener("itemUpdated", handler);
    return () => window.removeEventListener("itemUpdated", handler);
  }, [id]);

  const fetchItem = async () => {
    try {
      setIsLoading(true);
      if (id) { const data = await mockApi.getItem(id); setItem(data); }
    } catch (error) { console.error("Error fetching item:", error); }
    finally { setIsLoading(false); }
  };

  const handleDelete = async () => {
    if (!id) return;
    try { await mockApi.deleteItem(id); toast.success("Item deleted"); navigate("/home"); }
    catch { toast.error("Failed to delete item"); }
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
    } catch { toast.error("Failed to process action"); }
  };

  const handleSubmitAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await mockApi.handleUnclaimedAction(id, "auction", auctionData);
      window.dispatchEvent(new Event("itemUpdated"));
      window.dispatchEvent(new Event("notificationsUpdated"));
      setShowAuctionModal(false);
      toast.success("Item moved to CampusAuction");
      fetchItem();
      setTimeout(() => navigate("/auction"), 1500);
    } catch { toast.error("Failed to move item to auction"); }
  };

  const isUnclaimedFor2Months = (createdAt: string) => {
    const diff = Date.now() - new Date(createdAt).getTime();
    return diff / (1000 * 60 * 60 * 24 * 30) >= 2;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Available": return "badge-available";
      case "Pending": return "badge-pending";
      case "Returned": return "badge-returned";
      case "Auction": return "badge-auction";
      case "Completed": return "badge-completed";
      default: return "badge-returned";
    }
  };

  const itemImages = item?.imageUrls || [];
  const isOwner = item?.userId === user?.id || item?.userId === "mock-user-id";
  const showUnclaimedAlert = item && isOwner && item.status === "Available" && isUnclaimedFor2Months(item.createdAt);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="pokeball-spinner" />
    </div>
  );

  if (!item) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card-minimal p-10 text-center">
        <p className="text-white/50 text-xl font-bold mb-4">Item not found</p>
        <button onClick={() => navigate("/home")} className="btn-poke-primary px-8 py-3">Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="navbar-poke sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black tracking-wider text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>ITEM DETAILS</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="card-minimal overflow-hidden animate-fadeIn">
          {/* Image section */}
          <div className="relative">
            <div className="aspect-video w-full overflow-hidden bg-[#0F0F23]">
              <img
                src={itemImages[0] || "https://via.placeholder.com/800x600/1E2040/FFCB05?text=?"}
                alt={item.name}
                className="w-full h-full object-cover opacity-85"
              />
            </div>
            {itemImages.length > 0 && (
              <button
                onClick={() => { setLightboxIndex(0); setShowLightbox(true); }}
                className="absolute top-4 right-4 bg-black/60 text-white p-2 rounded-xl hover:bg-black/80 transition-colors backdrop-blur-sm"
              >
                <Maximize2 size={18} />
              </button>
            )}
            {itemImages.length > 1 && (
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                {itemImages.length} photos
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {itemImages.length > 1 && (
            <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-white/[0.07] scrollbar-hide">
              {itemImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${item.name} ${index + 1}`}
                  className={`w-16 h-16 object-cover rounded-xl cursor-pointer shrink-0 transition-all ${
                    lightboxIndex === index ? "ring-2 ring-[#FFCB05] opacity-100" : "opacity-60 hover:opacity-90"
                  }`}
                  onClick={() => { setLightboxIndex(index); setShowLightbox(true); }}
                />
              ))}
            </div>
          )}

          <div className="p-6">
            {/* Title & Status */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <h2 className="text-2xl font-black text-white leading-tight">{item.name}</h2>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${getStatusClass(item.status)}`}>
                {item.status}
              </span>
            </div>

            {/* Poster row */}
            <div className="flex items-center justify-between mb-5 pb-5 border-b border-white/[0.07]">
              <button
                onClick={() => navigate(`/profile/${item.userId}`)}
                className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-colors -ml-2"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #E3350D 0%, #B02800 100%)" }}>
                  {getInitials(item.userName)}
                </div>
                <div className="text-left">
                  <p className="text-xs text-white/40 font-semibold">POSTED BY</p>
                  <p className="font-extrabold text-white text-sm">{item.userName}</p>
                </div>
              </button>
              {!isOwner && (
                <button
                  onClick={() => navigate(`/messages/${id}`)}
                  className="btn-poke-ghost p-2.5 rounded-xl flex items-center gap-2 text-sm px-4"
                >
                  <MessageCircle size={16} />
                  Message
                </button>
              )}
            </div>

            {/* Info chips */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="info-chip"><MapPin size={13} /> {formatLocation(item.location)}</span>
              <span className="info-chip"><Calendar size={13} /> Found {item.dateFound}</span>
              <span className="info-chip"><Clock size={13} /> Posted {getTimeAgo(item.createdAt)}</span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Description</p>
              <p className="text-white/70 leading-relaxed text-sm">{item.description}</p>
            </div>

            {/* Returned to */}
            {item.status === "Returned" && item.claimedBy && (
              <div className="mb-5 p-4 rounded-xl border border-green-500/20" style={{ background: "rgba(46,204,113,0.08)" }}>
                <p className="text-xs font-bold text-green-400 mb-2 uppercase tracking-wider">Returned To</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center text-xs font-black">
                    {getInitials(item.claimedBy)}
                  </div>
                  <span className="text-green-300 font-bold">{item.claimedBy}</span>
                </div>
              </div>
            )}

            {/* Unclaimed alert */}
            {showUnclaimedAlert && (
              <div className="mb-5 p-4 rounded-xl border border-yellow-500/20" style={{ background: "rgba(255,203,5,0.06)" }}>
                <p className="text-yellow-300 text-sm font-bold mb-3">
                  ⏰ This item has been unclaimed for 2 months. What would you like to do?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button onClick={() => handleUnclaimedAction("keep")} className="btn-poke-blue text-sm py-2.5 flex items-center justify-center gap-1.5">
                    <CheckCircle size={15} /> Keep it
                  </button>
                  <button onClick={() => handleUnclaimedAction("auction")} className="btn-poke-yellow text-sm py-2.5 flex items-center justify-center gap-1.5">
                    <Gavel size={15} /> Auction
                  </button>
                  <button onClick={() => handleUnclaimedAction("archive")} className="btn-poke-ghost text-sm py-2.5 flex items-center justify-center gap-1.5">
                    <Archive size={15} /> Archive
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {isOwner ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-blue-500/20 text-center text-blue-300 text-sm font-bold"
                  style={{ background: "rgba(61,125,202,0.1)" }}>
                  You posted this item
                </div>
                {item.status === "Pending" && (
                  <div className="p-3 rounded-xl border border-yellow-500/20 text-center text-yellow-300 text-sm"
                    style={{ background: "rgba(255,203,5,0.07)" }}>
                    Someone has claimed this item. Check your notifications to review.
                  </div>
                )}
                {item.status !== "Returned" && item.status !== "Auction" && (
                  <div className="flex gap-3">
                    <button onClick={() => navigate(`/edit-item/${id}`)}
                      className="btn-poke-ghost flex-1 flex items-center justify-center gap-2 py-3">
                      <Edit size={16} /> Edit
                    </button>
                    <button onClick={() => setShowDeleteConfirm(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all">
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {item.status === "Available" && (
                  <button onClick={() => navigate(`/claim/${id}`)} className="btn-poke-primary w-full py-4 text-base flex items-center justify-center gap-2">
                    🎯 This is Mine — Claim It
                  </button>
                )}
                {item.status === "Pending" && (
                  <div className="p-4 rounded-xl border border-yellow-500/20 text-center text-yellow-300 text-sm font-semibold"
                    style={{ background: "rgba(255,203,5,0.07)" }}>
                    A claim is pending verification for this item
                  </div>
                )}
                {item.status === "Returned" && (
                  <div className="p-4 rounded-xl border border-blue-500/20 text-center text-blue-300 text-sm font-semibold"
                    style={{ background: "rgba(61,125,202,0.1)" }}>
                    ✅ This item has been returned to its owner
                  </div>
                )}
                {item.status === "Auction" && (
                  <button onClick={() => navigate(`/auction/${id}`)} className="btn-poke-yellow w-full py-4 text-base flex items-center justify-center gap-2">
                    <Gavel size={18} /> View in CampusAuction
                  </button>
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="modal-poke p-6 max-w-sm w-full animate-scaleIn">
            <h3 className="text-xl font-black text-white mb-2">Delete Item?</h3>
            <p className="text-white/50 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-poke-ghost flex-1 py-3">Cancel</button>
              <button onClick={handleDelete} className="btn-poke-primary flex-1 py-3">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Auction modal */}
      {showAuctionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="modal-poke p-6 max-w-md w-full animate-scaleIn">
            <h3 className="text-xl font-black text-white mb-1">Move to CampusAuction</h3>
            <p className="text-white/40 text-sm mb-5">What would you like in exchange?</p>
            <form onSubmit={handleSubmitAuction} className="space-y-4">
              <div>
                <label className="block mb-2">What do you want? <span className="text-red-400">*</span></label>
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
                <label className="block mb-2">Additional notes <span className="text-white/30">(optional)</span></label>
                <textarea
                  value={auctionData.ownerWantsNotes}
                  onChange={(e) => setAuctionData({ ...auctionData, ownerWantsNotes: e.target.value })}
                  className="input-poke resize-none"
                  rows={3}
                  placeholder="Any preferences or details..."
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAuctionModal(false)} className="btn-poke-ghost flex-1 py-3">Cancel</button>
                <button type="submit" className="btn-poke-yellow flex-1 py-3 flex items-center justify-center gap-2">
                  <Gavel size={16} /> Move to Auction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
