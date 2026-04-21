import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Package, History, Archive, Gavel, MapPin, Clock, MessageCircle } from "lucide-react";
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

export default function MyItems() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"posted" | "claimed" | "archived">("posted");
  const [postedItems, setPostedItems] = useState<Item[]>([]);
  const [claimedItems, setClaimedItems] = useState<Item[]>([]);
  const [archivedItems, setArchivedItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchMyItems(); }, []);

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

  const items = activeTab === "posted" ? postedItems : activeTab === "claimed" ? claimedItems : archivedItems;

  const TABS = [
    { key: "posted", label: "Posted", icon: Package, count: postedItems.length },
    { key: "claimed", label: "Claimed", icon: History, count: claimedItems.length },
    { key: "archived", label: "Vault", icon: Archive, count: archivedItems.length },
  ] as const;

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
          <div>
            <h1 className="text-xl font-black tracking-wider text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              MY ITEMS
            </h1>
            {user && <p className="text-xs text-white/40 leading-none">Trainer {user.name}</p>}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Auction CTA */}
        <button
          onClick={() => navigate("/auction")}
          className="btn-poke-yellow w-full mb-5 flex items-center justify-center gap-2 py-4"
        >
          <Gavel size={20} />
          Explore CampusAuction
        </button>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1.5 bg-white/[0.05] rounded-2xl border border-white/[0.08]">
          {TABS.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === key
                  ? "btn-poke-primary shadow-lg"
                  : "text-white/50 hover:text-white hover:bg-white/[0.07]"
              }`}
            >
              <Icon size={16} />
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === key ? "bg-white/20" : "bg-white/10"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="pokeball-spinner" />
          </div>
        ) : items.length === 0 ? (
          <div className="card-minimal text-center py-16 px-8">
            <div className="text-5xl mb-4">
              {activeTab === "posted" ? "📦" : activeTab === "claimed" ? "📋" : "🗄️"}
            </div>
            <p className="text-white/50 font-bold text-lg mb-2">No items here</p>
            <p className="text-white/30 text-sm">
              {activeTab === "posted" && "Post an item you found to help others"}
              {activeTab === "claimed" && "Claim items that belong to you"}
              {activeTab === "archived" && "Archived items will appear here"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => navigate(`/item/${item.id}`)}
                className="pokeball-card cursor-pointer animate-stagger"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={item.imageUrls?.[0] || "https://via.placeholder.com/400x300/1E2040/FFCB05?text=?"}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-extrabold text-white text-sm mb-2">{item.name}</h3>
                  <div className="flex items-center gap-1 text-white/40 text-xs mb-1">
                    <MapPin size={11} />
                    <span>{formatLocation(item.location)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/30 text-xs mb-3">
                    <Clock size={11} />
                    <span>{getTimeAgo(item.createdAt)}</span>
                  </div>
                  {activeTab === "posted" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/messages/${item.id}`); }}
                      className="btn-poke-ghost text-xs py-2 px-3 flex items-center gap-1.5 w-full justify-center"
                    >
                      <MessageCircle size={14} />
                      Messages
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
