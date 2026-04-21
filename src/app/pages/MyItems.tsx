import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Package, History, Archive, Gavel } from "lucide-react";
import { useAuth } from "../context/AuthContext";
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
}

const CATEGORY_EMOJI: Record<string, string> = {
  electronics: "📱", bags: "🎒", clothing: "👕",
  books: "📚", accessories: "⌚", other: "📦",
};

export default function MyItems() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"posted" | "claimed" | "archived">("posted");
  const [postedItems, setPostedItems] = useState<Item[]>([]);
  const [claimedItems, setClaimedItems] = useState<Item[]>([]);
  const [archivedItems, setArchivedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyItems();
    const handler = () => fetchMyItems();
    window.addEventListener("itemUpdated", handler);
    return () => window.removeEventListener("itemUpdated", handler);
  }, []);

  const fetchMyItems = async () => {
    try {
      setIsLoading(true);
      const data = await mockApi.getMyItems();
      setPostedItems(data.posted || []);
      setClaimedItems(data.claimed || []);
      setArchivedItems(data.archived || []);
    } catch (error) {
      console.error("Error fetching my items:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const items = activeTab === "posted" ? postedItems : activeTab === "claimed" ? claimedItems : archivedItems;

  const TABS = [
    { key: "posted", label: "Posted", icon: <Package size={16} />, count: postedItems.length },
    { key: "claimed", label: "Claimed", icon: <History size={16} />, count: claimedItems.length },
    { key: "archived", label: "Vault", icon: <Archive size={16} />, count: archivedItems.length },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="navbar-poke sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/home")} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl text-white font-bold tracking-wide">My Items</h1>
          {user && <p className="text-white/60 text-sm ml-auto">{user.name}</p>}
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full px-4 py-5 space-y-4 flex-1">
        {/* Auction CTA */}
        <button
          onClick={() => navigate("/auction")}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all border border-[rgba(206,147,216,0.4)] bg-[rgba(206,147,216,0.1)] text-[#ce93d8] hover:bg-[rgba(206,147,216,0.2)]"
        >
          <Gavel size={18} />
          Explore CampusAuction
        </button>

        {/* Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "var(--poke-surface-2)" }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-sm font-bold ${
                activeTab === tab.key
                  ? "bg-[#1565C0] text-white shadow-lg"
                  : "text-[var(--poke-text-muted)] hover:text-[var(--poke-text)]"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-[var(--poke-surface)] text-[var(--poke-text-muted)]"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-14 text-[var(--poke-text-muted)]">Loading...</div>
        ) : items.length === 0 ? (
          <div className="card-poke text-center py-14 px-6">
            <p className="text-4xl mb-4">
              {activeTab === "posted" ? "📦" : activeTab === "claimed" ? "📥" : "🗄️"}
            </p>
            <p className="font-bold text-[var(--poke-text)] mb-2">No items yet</p>
            <p className="text-sm text-[var(--poke-text-muted)]">
              {activeTab === "posted" && "Post an item you found to help others"}
              {activeTab === "claimed" && "Items you've claimed will appear here"}
              {activeTab === "archived" && "Archived items appear here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => navigate(`/item/${item.id}`)}
                className="poke-item-card animate-card-appear"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="h-36 bg-[#1a237e] relative overflow-hidden">
                  {item.imageUrls?.[0] ? (
                    <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-50">
                      {CATEGORY_EMOJI[item.category] || "📦"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--poke-surface)] via-transparent to-transparent" />
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm text-[var(--poke-text)] mb-1 truncate">{item.name}</h3>
                  <p className="text-xs text-[var(--poke-text-muted)] mb-3">📍 {formatLocation(item.location)}</p>
                  <div className="flex items-center justify-between">
                    <span className={getStatusBadge(item.status)}>{item.status}</span>
                    {activeTab === "posted" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/messages/${item.id}`); }}
                        className="text-xs text-[var(--poke-blue-light)] hover:text-white transition-colors font-semibold"
                      >
                        Messages
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav-poke">
        <button onClick={() => navigate("/home")} className="bnav-item">
          <span className="bnav-icon-wrap">🏠</span>
          <span className="bnav-label">HOME</span>
        </button>
        <button onClick={() => navigate("/auction")} className="bnav-item">
          <span className="bnav-icon-wrap"><Gavel size={20} /></span>
          <span className="bnav-label">AUCTION</span>
        </button>
        <button className="bnav-item active">
          <span className="bnav-icon-wrap">🎒</span>
          <span className="bnav-label">MY ITEMS</span>
        </button>
      </nav>
    </div>
  );
}
