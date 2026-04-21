import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MapPin, Calendar, CheckCircle, Send, Gavel, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";
import { formatLocation, getTimeAgo, getInitials } from "../lib/utils";
import { toast } from "sonner";

interface Item {
  id: string; name: string; category: string; location: string; dateFound: string;
  description: string; status: string; imageUrls?: string[]; userId: string;
  userName: string; createdAt: string; ownerWants?: string; ownerWantsNotes?: string; acceptedOfferId?: string;
}
interface Offer {
  id: string; itemId: string; userId: string; userName: string;
  offering: string; offerDetails?: string; createdAt: string; accepted: boolean;
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
        if (itemData) setOffers(await mockApi.getOffers(id));
      }
    } catch (error) { console.error("Error:", error); }
    finally { setIsLoading(false); }
  };

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    try {
      await mockApi.submitOffer(id, offerData);
      window.dispatchEvent(new Event("notificationsUpdated"));
      toast.success("Offer submitted!");
      setOfferData({ offering: "", offerDetails: "" });
      fetchData();
    } catch { toast.error("Failed to submit offer"); }
    finally { setIsSubmitting(false); }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await mockApi.acceptOffer(offerId);
      toast.success("Offer accepted! Coordinate the exchange.");
      fetchData();
    } catch { toast.error("Failed to accept offer"); }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="pokeball-spinner" /></div>;
  if (!item) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card-minimal p-10 text-center">
        <p className="text-white/50 text-xl font-bold mb-4">Auction item not found</p>
        <button onClick={() => navigate("/auction")} className="btn-poke-yellow px-8 py-3">Back to Auction</button>
      </div>
    </div>
  );

  const isOwner = item.userId === user?.id || item.userId === "mock-user-id";
  const isCompleted = item.status === "Completed";
  const acceptedOffer = offers.find(o => o.id === item.acceptedOfferId);

  return (
    <div className="min-h-screen">
      <header className="navbar-poke sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate("/auction")} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Gavel size={18} className="text-[#FFCB05]" />
            <h1 className="text-xl font-black tracking-wider text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>AUCTION DETAILS</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Item Card */}
        <div className="card-minimal overflow-hidden animate-fadeIn">
          <div className="aspect-video w-full overflow-hidden bg-[#0F0F23]">
            <img src={item.imageUrls?.[0] || "https://via.placeholder.com/800x600/1E2040/FFCB05?text=?"} alt={item.name} className="w-full h-full object-cover opacity-85" />
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-2xl font-black text-white">{item.name}</h2>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 ${isCompleted ? "badge-completed" : "badge-auction"}`}>
                {isCompleted ? "Completed" : "🔨 In Auction"}
              </span>
            </div>

            {/* Poster */}
            <button onClick={() => navigate(`/profile/${item.userId}`)} className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-colors -ml-2 mb-5 pb-5 border-b border-white/[0.07] w-full">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0"
                style={{ background: "linear-gradient(135deg, #9B59B6 0%, #7D3C98 100%)" }}>
                {getInitials(item.userName)}
              </div>
              <div className="text-left">
                <p className="text-xs text-white/40 font-semibold">POSTED BY</p>
                <p className="font-extrabold text-white text-sm">{item.userName}</p>
              </div>
            </button>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="info-chip"><MapPin size={13} />{formatLocation(item.location)}</span>
              <span className="info-chip"><Calendar size={13} />Found {item.dateFound}</span>
              <span className="info-chip"><Clock size={13} />{getTimeAgo(item.createdAt)}</span>
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2">Description</p>
              <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
            </div>

            {/* Owner wants */}
            <div className="p-4 rounded-xl border border-purple-500/25" style={{ background: "rgba(155,89,182,0.12)" }}>
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1.5">Owner is looking for</p>
              <p className="text-purple-100 font-extrabold text-lg">{item.ownerWants}</p>
              {item.ownerWantsNotes && <p className="text-purple-300/80 text-sm mt-1">{item.ownerWantsNotes}</p>}
            </div>

            {/* Accepted offer banner */}
            {isCompleted && acceptedOffer && (
              <div className="mt-4 p-4 rounded-xl border border-green-500/25" style={{ background: "rgba(46,204,113,0.08)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-400" />
                  <p className="text-green-300 font-black text-sm uppercase tracking-wider">Accepted Offer</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-black">
                    {getInitials(acceptedOffer.userName)}
                  </div>
                  <span className="text-green-200 font-bold text-sm">{acceptedOffer.userName}</span>
                </div>
                <p className="text-green-300 text-sm"><span className="font-bold">Offering:</span> {acceptedOffer.offering}</p>
                {acceptedOffer.offerDetails && <p className="text-green-400/70 text-xs mt-1">{acceptedOffer.offerDetails}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Owner: view offers */}
        {isOwner ? (
          <div className="card-minimal p-6">
            <h3 className="font-black text-white mb-4" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.25rem", letterSpacing: "0.05em" }}>
              OFFERS RECEIVED ({offers.length})
            </h3>
            {offers.length === 0 ? (
              <div className="text-center py-10 text-white/30 font-semibold">No offers yet. Check back later!</div>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className={`p-4 rounded-xl border ${offer.accepted ? "border-green-500/25 bg-green-500/[0.06]" : "border-white/10 bg-white/[0.03]"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center text-xs font-black">
                          {getInitials(offer.userName)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{offer.userName}</p>
                          <p className="text-xs text-white/30">{getTimeAgo(offer.createdAt)}</p>
                        </div>
                      </div>
                      {offer.accepted && <span className="badge-completed px-2.5 py-1 rounded-full text-xs font-bold">✓ Accepted</span>}
                    </div>
                    <p className="text-white/80 text-sm mb-1"><span className="font-bold text-white">Offering:</span> {offer.offering}</p>
                    {offer.offerDetails && <p className="text-white/50 text-xs mb-3">{offer.offerDetails}</p>}
                    {!isCompleted && !offer.accepted && (
                      <button onClick={() => handleAcceptOffer(offer.id)} className="btn-poke-yellow w-full py-2.5 text-sm flex items-center justify-center gap-1.5">
                        <CheckCircle size={15} /> Accept Offer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="card-minimal p-6">
            <h3 className="font-black text-white mb-1" style={{ fontFamily: "Rajdhani, sans-serif", fontSize: "1.25rem", letterSpacing: "0.05em" }}>
              SUBMIT YOUR OFFER
            </h3>
            {isCompleted ? (
              <div className="text-center py-10 text-white/30 font-semibold">This auction has ended — the owner accepted an offer.</div>
            ) : (
              <form onSubmit={handleSubmitOffer} className="space-y-4 mt-4">
                <div>
                  <label className="block mb-2">What are you offering? <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={offerData.offering}
                    onChange={e => setOfferData({ ...offerData, offering: e.target.value })}
                    className="input-poke"
                    placeholder="e.g., Starbucks gift card, homemade cookies"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Additional details <span className="text-white/30">(optional)</span></label>
                  <textarea
                    value={offerData.offerDetails}
                    onChange={e => setOfferData({ ...offerData, offerDetails: e.target.value })}
                    className="input-poke resize-none"
                    rows={3}
                    placeholder="Any additional information about your offer..."
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-poke-yellow w-full py-4 flex items-center justify-center gap-2 text-base">
                  {isSubmitting ? <><div className="pokeball-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />Submitting...</> : <><Send size={18} />Submit Offer</>}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
