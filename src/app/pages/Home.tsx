import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Plus, LogOut, Filter, User, Gavel, MapPin, Clock, ChevronDown, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";
import { formatLocation, getTimeAgo } from "../lib/utils";
import Fuse from "fuse.js";
import ItemCardSkeleton from "../components/ItemCardSkeleton";
import NotificationsPanel from "../components/NotificationsPanel";
import DemoModeButton from "../components/DemoModeButton";

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

const CATEGORY_TYPES: Record<string, string> = {
  electronics: "type-electronics",
  bags: "type-bags",
  clothing: "type-clothing",
  books: "type-books",
  accessories: "type-accessories",
  other: "type-other",
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
    () => new Fuse(items, { keys: ["name", "description", "location", "category"], threshold: 0.3, includeScore: true }),
    [items]
  );

  const filteredItems = useMemo(() => {
    let list = items;
    if (searchQuery.trim()) list = fuse.search(searchQuery).map((r) => r.item);
    if (categoryFilter !== "all") list = list.filter((i) => i.category === categoryFilter);
    if (statusFilter !== "all") list = list.filter((i) => i.status === statusFilter);
    return list;
  }, [searchQuery, categoryFilter, statusFilter, fuse, items]);

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

  const getCategoryLabel = (cat: string) =>
    ({ electronics: "Electronics", bags: "Bags", clothing: "Clothing", books: "Books", accessories: "Accessories", other: "Other" }[cat] ?? cat);

  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <header className="navbar-poke sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mini pokéball logo */}
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 shrink-0 relative">
              <div className="absolute inset-0 bg-[#E3350D]" style={{ clipPath: 'polygon(0 0,100% 0,100% 48%,0 48%)' }} />
              <div className="absolute inset-0 bg-white" style={{ clipPath: 'polygon(0 52%,100% 52%,100% 100%,0 100%)' }} />
              <div className="absolute top-[44%] left-0 right-0 h-[12%] bg-gray-900" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full border border-gray-900 z-10" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white leading-none" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
                CAMPUS<span className="text-[#FFCB05]">CATCH</span>
              </h1>
              {user && <p className="text-xs text-white/50 leading-none mt-0.5">Trainer {user.name}</p>}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <DemoModeButton />
            <NotificationsPanel />
            <button
              onClick={() => navigate("/auction")}
              className="p-2.5 text-white/70 hover:text-[#FFCB05] hover:bg-white/10 rounded-xl transition-all"
              title="CampusAuction"
            >
              <Gavel size={20} />
            </button>
            <button
              onClick={() => navigate("/my-items")}
              className="p-2.5 text-white/70 hover:text-[#FFCB05] hover:bg-white/10 rounded-xl transition-all"
              title="My Items"
            >
              <User size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 text-white/70 hover:text-red-400 hover:bg-white/10 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items or locations..."
                className="input-poke pl-10"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 font-bold text-sm transition-all border ${
                showFilters
                  ? "bg-[#FFCB05] text-gray-900 border-[#FFCB05]"
                  : "bg-white/[0.06] text-white/70 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              <Filter size={16} />
              Filter
              <ChevronDown size={14} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {showFilters && (
            <div className="card-minimal p-4 grid grid-cols-2 gap-3 animate-slideUp">
              <div>
                <label className="block mb-1.5 text-xs">Category</label>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-poke text-sm py-2.5">
                  <option value="all">All Types</option>
                  <option value="electronics">Electronics</option>
                  <option value="bags">Bags & Backpacks</option>
                  <option value="clothing">Clothing</option>
                  <option value="books">Books & Stationery</option>
                  <option value="accessories">Accessories</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1.5 text-xs">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-poke text-sm py-2.5">
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

        {/* Post button */}
        <button
          onClick={() => navigate("/post")}
          className="btn-poke-primary w-full mb-6 flex items-center justify-center gap-2 py-4 text-base"
        >
          <Plus size={20} />
          Post Found Item
        </button>

        {/* Stats row */}
        {!isLoading && items.length > 0 && (
          <div className="flex items-center gap-4 mb-4">
            <p className="text-white/40 text-sm font-semibold">
              {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"} found
            </p>
            {(categoryFilter !== "all" || statusFilter !== "all" || searchQuery) && (
              <button
                onClick={() => { setSearchQuery(""); setCategoryFilter("all"); setStatusFilter("all"); }}
                className="text-[#FFCB05] text-xs font-bold hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => <ItemCardSkeleton key={i} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card-minimal text-center py-16 px-8">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 opacity-40">
              <div className="w-full h-full rounded-full border-4 border-white/20 relative">
                <div className="absolute inset-0 bg-white/10" />
              </div>
            </div>
            <p className="text-white/50 text-lg font-bold mb-2">No items discovered</p>
            <p className="text-white/30 text-sm">
              {searchQuery ? "Try a different search term" : "Adjust your filters to find items"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                onClick={() => navigate(`/item/${item.id}`)}
                className="pokeball-card cursor-pointer animate-stagger"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#1E2040] to-[#0F0F23]">
                  <img
                    src={item.imageUrls?.[0] || "https://via.placeholder.com/400x300/1E2040/FFCB05?text=?"}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
                  />
                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  {/* Category badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold capitalize ${CATEGORY_TYPES[item.category] ?? "type-other"}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="font-extrabold text-white text-base mb-2 leading-tight">{item.name}</h3>
                  <div className="flex items-center gap-1 text-white/50 text-xs mb-1.5">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{formatLocation(item.location)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/35 text-xs">
                    <Clock size={12} className="shrink-0" />
                    <span>Found {getTimeAgo(item.createdAt)}</span>
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
