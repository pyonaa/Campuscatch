import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Calendar, CheckCircle, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";
import { formatLocation, getTimeAgo, getInitials } from "../lib/utils";
import { toast } from "sonner";

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
  ownerWants?: string;
  ownerWantsNotes?: string;
  acceptedOfferId?: string;
}

interface Offer {
  id: string;
  itemId: string;
  userId: string;
  userName: string;
  offering: string;
  offerDetails?: string;
  createdAt: string;
  accepted: boolean;
}

export default function AuctionItemDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [offerData, setOfferData] = useState({ offering: "", offerDetails: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (id) {
        const itemData = await mockApi.getAuctionItem(id);
        setItem(itemData);
        if (itemData) {
          const offersData = await mockApi.getOffers(id);
          setOffers(offersData);
        }
      }
    } catch (error) {
      console.error("Error fetching auction item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    try {
      await mockApi.submitOffer(id, { offering: offerData.offering, offerDetails: offerData.offerDetails });
      window.dispatchEvent(new Event("notificationsUpdated"));
      toast.success("Offer submitted successfully!");
      setOfferData({ offering: "", offerDetails: "" });
      fetchData();
    } catch {
      toast.error("Failed to submit offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await mockApi.acceptOffer(offerId);
      toast.success("Offer accepted! You can now coordinate the exchange.");
      fetchData();
    } catch {
      toast.error("Failed to accept offer");
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
          <h2 className="text-2xl mb-4 text-[var(--poke-text)]">Auction item not found</h2>
          <button onClick={() => navigate("/auction")} className="btn-poke-primary">
            Back to CampusAuction
          </button>
        </div>
      </div>
    );
  }

  const isOwner = item.userId === user?.id || item.userId === "mock-user-id";
  const isCompleted = item.status === "Completed";
  const acceptedOffer = offers.find(o => o.id === item.acceptedOfferId);
  const labelClass = "block text-xs font-bold text-[var(--poke-text-muted)] uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen">
      <header className="navbar-poke sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/auction")} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl text-white font-bold tracking-wide">Auction Details</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Item card */}
        <div className="card-poke overflow-hidden">
          <div className="aspect-video w-full overflow-hidden bg-[#1a0d33]">
            <img
              src={item.imageUrls?.[0] || "https://via.placeholder.com/800x600/1a0d33/ce93d8?text=No+Image"}
              alt={item.name}
              className="w-full h-full object-cover opacity-80"
            />
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--poke-text)]">{item.name}</h2>
              <span className={isCompleted ? "badge-completed" : "badge-auction"}>
                {isCompleted ? "Completed" : "In Auction"}
              </span>
            </div>

            {/* Poster */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[var(--poke-border)]">
              <button
                onClick={() => navigate(`/profile/${item.userId}`)}
                className="flex items-center gap-3 hover:bg-[var(--poke-surface-2)] p-2 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: "linear-gradient(135deg, #7b1fa2, #4a148c)" }}>
                  {getInitials(item.userName)}
                </div>
                <div className="text-left">
                  <p className="text-xs text-[var(--poke-text-muted)]">Posted by</p>
                  <p className="font-semibold text-[var(--poke-text)]">{item.userName}</p>
                </div>
              </button>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-[var(--poke-text-muted)] text-sm">
                <MapPin size={14} className="text-[#ce93d8]" />
                <span>{formatLocation(item.location)}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--poke-text-muted)] text-sm">
                <Calendar size={14} className="text-[#ce93d8]" />
                <span>Found on {item.dateFound}</span>
              </div>
              <p className="text-xs text-[var(--poke-text-dim)]">Posted {getTimeAgo(item.createdAt)}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold text-[var(--poke-text-muted)] uppercase tracking-wider mb-2">Description</h3>
              <p className="text-[var(--poke-text)] text-sm leading-relaxed">{item.description}</p>
            </div>

            {/* Owner wants */}
            <div className="p-4 rounded-xl border border-[rgba(206,147,216,0.3)] bg-[rgba(206,147,216,0.08)]">
              <h3 className="text-xs font-bold text-[#ce93d8] uppercase tracking-wider mb-2">Owner is looking for</h3>
              <p className="text-[var(--poke-text)] font-semibold text-lg mb-1">{item.ownerWants}</p>
              {item.ownerWantsNotes && (
                <p className="text-[var(--poke-text-muted)] text-sm">{item.ownerWantsNotes}</p>
              )}
            </div>

            {/* Accepted offer */}
            {isCompleted && acceptedOffer && (
              <div className="mt-4 p-4 rounded-xl card-poke-info">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={16} className="text-[var(--poke-blue-light)]" />
                  <h3 className="text-xs font-bold text-[var(--poke-blue-light)] uppercase tracking-wider">Accepted Offer</h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #1565C0, #0D47A1)" }}>
                    {getInitials(acceptedOffer.userName)}
                  </div>
                  <span className="font-semibold text-[var(--poke-text)] text-sm">{acceptedOffer.userName}</span>
                </div>
                <p className="text-sm text-[var(--poke-text-muted)]"><strong className="text-[var(--poke-text)]">Offering:</strong> {acceptedOffer.offering}</p>
                {acceptedOffer.offerDetails && <p className="text-xs text-[var(--poke-text-muted)] mt-1">{acceptedOffer.offerDetails}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Offers section */}
        {isOwner ? (
          <div className="card-poke p-6">
            <h3 className="text-base font-bold text-[var(--poke-text)] mb-4">
              Offers Received ({offers.length})
            </h3>
            {offers.length === 0 ? (
              <p className="text-[var(--poke-text-muted)] text-center py-8 text-sm">No offers yet — check back later!</p>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className={`rounded-xl p-4 border ${
                    offer.accepted
                      ? "border-[rgba(66,165,245,0.3)] bg-[rgba(66,165,245,0.08)]"
                      : "border-[var(--poke-border)] bg-[var(--poke-surface-2)]"
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "linear-gradient(135deg, #7b1fa2, #4a148c)" }}>
                          {getInitials(offer.userName)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-[var(--poke-text)]">{offer.userName}</p>
                          <p className="text-xs text-[var(--poke-text-dim)]">{getTimeAgo(offer.createdAt)}</p>
                        </div>
                      </div>
                      {offer.accepted && <span className="badge-returned">Accepted</span>}
                    </div>
                    <p className="text-sm text-[var(--poke-text-muted)] mb-1">
                      <strong className="text-[var(--poke-text)]">Offering:</strong> {offer.offering}
                    </p>
                    {offer.offerDetails && <p className="text-xs text-[var(--poke-text-muted)] mb-3">{offer.offerDetails}</p>}
                    {!isCompleted && !offer.accepted && (
                      <button onClick={() => handleAcceptOffer(offer.id)}
                        className="w-full btn-poke-primary py-2 text-sm flex items-center justify-center gap-2 mt-2">
                        <CheckCircle size={16} /> Accept Offer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card-poke p-6">
            <h3 className="text-base font-bold text-[var(--poke-text)] mb-4">Submit Your Offer</h3>
            {isCompleted ? (
              <p className="text-[var(--poke-text-muted)] text-center py-8 text-sm">
                This auction has ended. The owner has accepted an offer.
              </p>
            ) : (
              <form onSubmit={handleSubmitOffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--poke-text-muted)] uppercase tracking-wider mb-2">
                    What are you offering? <span className="text-red-400">*</span>
                  </label>
                  <input type="text" value={offerData.offering}
                    onChange={(e) => setOfferData({ ...offerData, offering: e.target.value })}
                    className="input-poke w-full" placeholder="e.g., Starbucks gift card, homemade cookies" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--poke-text-muted)] uppercase tracking-wider mb-2">
                    Additional details (optional)
                  </label>
                  <textarea value={offerData.offerDetails}
                    onChange={(e) => setOfferData({ ...offerData, offerDetails: e.target.value })}
                    className="input-poke w-full resize-none" rows={3}
                    placeholder="Any additional information about your offer..." />
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="btn-poke-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send size={16} />
                  {isSubmitting ? "Submitting..." : "Submit Offer"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
