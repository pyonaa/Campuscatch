import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Gavel } from "lucide-react";
import { mockApi } from "../lib/mockApi";
import { formatLocation, getTimeAgo } from "../lib/utils";

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
}

const CATEGORY_EMOJI: Record<string, string> = {
  electronics: "📱", bags: "🎒", clothing: "👕",
  books: "📚", accessories: "⌚", other: "📦",
};

export default function CampusAuction() {
  const navigate = useNavigate();
  const [auctionItems, setAuctionItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuctionItems();
    const handler = () => fetchAuctionItems();
    window.addEventListener("itemUpdated", handler);
    return () => window.removeEventListener("itemUpdated", handler);
  }, []);

  const fetchAuctionItems = async () => {
    try {
      setIsLoading(true);
      const items = await mockApi.getAuctionItems();
      setAuctionItems(items);
    } catch (error) {
      console.error("Error fetching auction items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="navbar-poke sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/home")} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Gavel size={22} className="text-[var(--poke-yellow)]" />
            <h1 className="text-xl text-white font-bold tracking-wide">CampusAuction</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 py-5 flex-1 space-y-5">
        {/* Info card */}
        <div className="card-poke p-4 border border-[rgba(206,147,216,0.25)] bg-[rgba(206,147,216,0.07)]">
          <h2 className="text-sm font-bold text-[#ce93d8] mb-1 flex items-center gap-2">
            <Gavel size={14} /> How CampusAuction Works
          </h2>
          <p className="text-xs text-[var(--poke-text-muted)] leading-relaxed">
            Trade unclaimed items through non-monetary exchanges. Item owners specify what they want — submit an offer and coordinate the exchange once accepted.
          </p>
          <p className="text-xs text-[var(--poke-text-dim)] mt-2">
            💡 Items unclaimed 2+ months can be moved here by their owners.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-14 text-[var(--poke-text-muted)]">Loading auction items...</div>
        ) : auctionItems.length === 0 ? (
          <div className="card-poke text-center py-14 px-6">
            <p className="text-4xl mb-4">⚔️</p>
            <p className="font-bold text-[var(--poke-text)] mb-2">No items in auction</p>
            <p className="text-sm text-[var(--poke-text-muted)]">
              Items unclaimed for 2+ months can be moved here
            </p>
          </div>
        ) : (
          <>
            <p className="section-label-poke">{auctionItems.length} item{auctionItems.length !== 1 ? "s" : ""} up for trade</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctionItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/auction/${item.id}`)}
                  className="poke-item-card animate-card-appear"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className="radar-ping">📡</div>
                  <div className="h-40 bg-[#1a0d33] relative overflow-hidden">
                    {item.imageUrls?.[0] ? (
                      <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover opacity-75" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">
                        {CATEGORY_EMOJI[item.category] || "📦"}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--poke-surface)] via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className="badge-auction">AUCTION</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-[var(--poke-text)] mb-1 truncate">{item.name}</h3>
                    <p className="text-xs text-[var(--poke-text-muted)] mb-2">📍 {formatLocation(item.location)}</p>
                    {item.ownerWants && (
                      <div className="flex items-center gap-1.5 bg-[rgba(206,147,216,0.1)] border border-[rgba(206,147,216,0.2)] rounded-lg px-2 py-1.5">
                        <span className="text-xs text-[var(--poke-text-dim)]">Wants:</span>
                        <span className="text-xs font-bold text-[#ce93d8] truncate">{item.ownerWants}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav-poke">
        <button onClick={() => navigate("/home")} className="bnav-item">
          <span className="bnav-icon-wrap">🏠</span>
          <span className="bnav-label">HOME</span>
        </button>
        <button className="bnav-item active">
          <span className="bnav-icon-wrap"><Gavel size={20} /></span>
          <span className="bnav-label">AUCTION</span>
        </button>
        <button onClick={() => navigate("/my-items")} className="bnav-item">
          <span className="bnav-icon-wrap">🎒</span>
          <span className="bnav-label">MY ITEMS</span>
        </button>
      </nav>
    </div>
  );
}
