import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Gavel, MapPin, Clock, Sparkles } from "lucide-react";
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

export default function CampusAuction() {
  const navigate = useNavigate();
  const [auctionItems, setAuctionItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuctionItems();
    const handleItemUpdated = () => fetchAuctionItems();
    window.addEventListener("itemUpdated", handleItemUpdated);
    return () => window.removeEventListener("itemUpdated", handleItemUpdated);
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
    <div className="min-h-screen">
      <header className="navbar-poke sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Gavel size={22} className="text-[#FFCB05]" />
            <h1 className="text-xl font-black tracking-wider text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              CAMPUS<span className="text-[#FFCB05]">AUCTION</span>
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info banner */}
        <div className="relative rounded-2xl p-5 mb-6 overflow-hidden border border-purple-500/20"
          style={{ background: 'linear-gradient(135deg, rgba(155,89,182,0.15) 0%, rgba(61,125,202,0.1) 100%)' }}>
          <div className="absolute right-4 top-4 text-purple-400/20 text-6xl pointer-events-none">⚔️</div>
          <div className="flex items-start gap-3 relative z-10">
            <div className="p-2 rounded-xl bg-purple-500/20 shrink-0">
              <Sparkles size={20} className="text-purple-300" />
            </div>
            <div>
              <h2 className="font-black text-white text-sm mb-1" style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.05em' }}>
                HOW CAMPUSAUCTION WORKS
              </h2>
              <p className="text-white/55 text-xs leading-relaxed">
                Trade unclaimed items through non-monetary exchanges. Item owners specify what they want,
                and you can submit offers. Once an offer is accepted, coordinate the exchange!
              </p>
              <p className="text-purple-300/80 text-xs mt-2 font-semibold">
                💡 Items unclaimed for 2+ months can be moved to Auction by their owners.
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="pokeball-spinner" />
          </div>
        ) : auctionItems.length === 0 ? (
          <div className="card-minimal text-center py-16 px-8">
            <Gavel size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/50 font-bold text-lg mb-2">No items in auction</p>
            <p className="text-white/30 text-sm">Items unclaimed for 2 months can be moved here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {auctionItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => navigate(`/auction/${item.id}`)}
                className="pokeball-card cursor-pointer animate-stagger group"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.imageUrls?.[0] || "https://via.placeholder.com/400x300/1E2040/FFCB05?text=?"}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500"
                  />
                  {/* Auction overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    {item.ownerWants && (
                      <div className="text-white text-sm font-bold">
                        <span className="text-purple-300 text-xs uppercase tracking-wider">Wants:</span>
                        <p className="text-white font-extrabold">{item.ownerWants}</p>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="badge-auction px-2.5 py-1 rounded-full text-xs font-bold">
                      🔨 Auction
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-extrabold text-white text-sm mb-2">{item.name}</h3>
                  {item.ownerWants && (
                    <div className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <span className="text-purple-300 text-xs font-semibold">Wants:</span>
                      <span className="text-purple-200 text-xs font-bold truncate">{item.ownerWants}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                    <MapPin size={11} />
                    <span>{formatLocation(item.location)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/30 text-xs">
                    <Clock size={11} />
                    <span>{getTimeAgo(item.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
