import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Plus, LogOut, Filter, Gavel } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";
import { formatLocation, getTimeAgo, getInitials } from "../lib/utils";
import Fuse from "fuse.js";
import ItemCardSkeleton from "../components/ItemCardSkeleton";
import NotificationsPanel from "../components/NotificationsPanel";

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

const CATEGORIES = [
  { value: "all", label: "ALL" },
  { value: "electronics", label: "ELECTRONICS" },
  { value: "bags", label: "BAGS" },
  { value: "clothing", label: "CLOTHING" },
  { value: "books", label: "BOOKS" },
  { value: "accessories", label: "ACCESSORIES" },
  { value: "other", label: "OTHER" },
];

const CATEGORY_EMOJI: Record<string, string> = {
  electronics: "📱",
  bags: "🎒",
  clothing: "👕",
  books: "📚",
  accessories: "⌚",
  other: "📦",
};

export default function Home() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [activeNav, setActiveNav] = useState("home");

  useEffect(() => {
    fetchItems();
    const handleItemUpdated = () => fetchItems();
    window.addEventListener("itemUpdated", handleItemUpdated);
    return () => window.removeEventListener("itemUpdated", handleItemUpdated);
  }, []);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const data = await mockApi.getAllItems();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ["name", "description", "location", "category"],
        threshold: 0.3,
        includeScore: true,
      }),
    [items]
  );

  const filteredItems = useMemo(() => {
    let filteredList = items;
    if (searchQuery.trim()) {
      filteredList = fuse.search(searchQuery).map((r) => r.item);
    }
    if (categoryFilter !== "all") {
      filteredList = filteredList.filter((item) => item.category === categoryFilter);
    }
    if (statusFilter !== "all") {
      filteredList = filteredList.filter((item) => item.status === statusFilter);
    }
    return filteredList;
  }, [searchQuery, categoryFilter, statusFilter, fuse, items]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Available": return "badge-available";
      case "Pending": return "badge-pending";
      case "Returned": return "badge-returned";
      case "Auction": return "badge-auction";
      case "Completed": return "badge-completed";
      default: return "badge-returned";
    }
  };

  const getCategoryEmoji = (category: string) =>
    CATEGORY_EMOJI[category] || "📦";

  // Fake XP progress (cosmetic)
  const xpPercent = 62;
  const playerLevel = 12;
  const userInitials = user?.name ? getInitials(user.name) : "T";

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── NAVBAR ── */}
      <header className="navbar-poke sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-wide text-white">
                Campus<span className="text-yellow-300">Catch</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsPanel />
              <button
                onClick={handleLogout}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Player HUD */}
          {user && (
            <div className="player-hud">
              <div className="player-avatar-hud">{userInitials}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <div className="player-xp-track">
                  <div className="player-xp-fill" style={{ width: `${xpPercent}%` }} />
                </div>
              </div>
              <div className="player-level-badge">LVL {playerLevel}</div>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-5 space-y-4">

        {/* ── SEARCH + FILTER ── */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--poke-text-dim)]"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items or locations..."
                className="input-poke pl-9"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 rounded-[14px] transition-all flex items-center gap-2 font-bold text-sm ${
                showFilters ? "btn-poke-primary py-2" : "btn-poke-secondary py-2"
              }`}
            >
              <Filter size={15} />
              Filter
            </button>
          </div>

          {showFilters && (
            <div className="card-poke p-4 space-y-3 animate-fadeIn">
              <div>
                <label className="block text-xs font-bold text-[var(--poke-text-muted)] mb-2 tracking-wider uppercase">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input-poke"
                >
                  <option value="all">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Pending">Pending</option>
                  <option value="Returned">Returned</option>
                  <option value="Auction">Auction</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── CATEGORY TABS ── */}
        <div className="cat-tab-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`cat-tab ${categoryFilter === cat.value ? "active" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ── POST BUTTON ── */}
        <button
          onClick={() => navigate("/post")}
          className="btn-poke-primary w-full"
        >
          <Plus size={18} />
          Report a Find
        </button>

        {/* ── ITEMS GRID ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ItemCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card-poke text-center py-14 px-6">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-bold text-[var(--poke-text)] mb-2">No items found</p>
            <p className="text-sm text-[var(--poke-text-muted)]">
              {searchQuery
                ? "Try a different search term or adjust your filters"
                : "Be the first to report a found item!"}
            </p>
          </div>
        ) : (
          <>
            <p className="section-label-poke">
              {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/item/${item.id}`)}
                  className="poke-item-card animate-card-appear"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Radar ping on hover */}
                  <div className="radar-ping">📡</div>

                  {/* Image */}
                  <div className="h-40 bg-[#1a237e] relative overflow-hidden">
                    {item.imageUrls?.[0] ? (
                      <img
                        src={item.imageUrls[0]}
                        alt={item.name}
                        className="w-full h-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl opacity-60">
                        {getCategoryEmoji(item.category)}
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--poke-surface)] via-transparent to-transparent" />
                  </div>

                  {/* Body */}
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-[var(--poke-text)] mb-1 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[var(--poke-text-muted)] mb-3 flex items-center gap-1">
                      📍 {formatLocation(item.location)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </span>
                      <span className="text-xs text-[var(--poke-text-dim)]">
                        {getTimeAgo(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── BOTTOM NAV ── */}
      <nav className="bottom-nav-poke">
        <button
          onClick={() => { setActiveNav("home"); }}
          className={`bnav-item ${activeNav === "home" ? "active" : ""}`}
        >
          <span className="bnav-icon-wrap">🏠</span>
          <span className="bnav-label">HOME</span>
        </button>
        <button
          onClick={() => { setActiveNav("auction"); navigate("/auction"); }}
          className={`bnav-item ${activeNav === "auction" ? "active" : ""}`}
        >
          <span className="bnav-icon-wrap"><Gavel size={20} /></span>
          <span className="bnav-label">AUCTION</span>
        </button>
        <button
          onClick={() => { setActiveNav("myitems"); navigate("/my-items"); }}
          className={`bnav-item ${activeNav === "myitems" ? "active" : ""}`}
        >
          <span className="bnav-icon-wrap">🎒</span>
          <span className="bnav-label">MY ITEMS</span>
        </button>
      </nav>
    </div>
  );
}
