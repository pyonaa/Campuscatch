import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";
import { getInitials } from "../lib/utils";
import ItemCarousel from "../components/ItemCarousel";

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

export default function UserProfile() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user } = useAuth();
  const [postedItems, setPostedItems] = useState<Item[]>([]);
  const [claimedItems, setClaimedItems] = useState<Item[]>([]);
  const [archivedItems, setArchivedItems] = useState<Item[]>([]);
  const [auctionItems, setAuctionItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = userId === user?.id || userId === "mock-user-id";
  const userName = isOwnProfile ? (user?.name || "Demo User") : "John Doe";

  useEffect(() => { fetchUserItems(); }, [userId]);

  const fetchUserItems = async () => {
    try {
      setIsLoading(true);
      if (isOwnProfile) {
        const data = await mockApi.getMyItems();
        setPostedItems(data.posted || []);
        setClaimedItems(data.claimed || []);
        setArchivedItems(data.archived || []);
        const allAuction = await mockApi.getAuctionItems();
        setAuctionItems(allAuction.filter(item => item.userId === "mock-user-id"));
      } else if (userId) {
        const data = await mockApi.getUserItems(userId);
        setPostedItems(data.posted || []);
        setClaimedItems(data.claimed || []);
      }
    } catch (error) {
      console.error("Error fetching user items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const userInitials = getInitials(userName);
  const totalItems = postedItems.length + claimedItems.length;

  return (
    <div className="min-h-screen">
      <header className="navbar-poke sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/home")} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl text-white font-bold tracking-wide">
            {isOwnProfile ? "My Profile" : "Trainer Profile"}
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile card */}
        <div className="card-poke p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1565C0, #0D47A1)", boxShadow: "0 0 24px rgba(21,101,192,0.4)" }}>
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-[var(--poke-text)] mb-1 truncate">{userName}</h2>
              <p className="text-sm text-[var(--poke-text-muted)]">
                {postedItems.length} item{postedItems.length !== 1 ? "s" : ""} posted
              </p>
              {isOwnProfile && (
                <div className="flex gap-3 mt-2 text-xs text-[var(--poke-text-dim)]">
                  <span>📦 {postedItems.length} posted</span>
                  <span>📥 {claimedItems.length} claimed</span>
                  <span>⚔️ {auctionItems.length} in auction</span>
                </div>
              )}
            </div>
            {!isOwnProfile && (
              <button onClick={() => navigate(`/messages/1`)} className="btn-poke-primary flex items-center gap-2 text-sm py-2 px-4">
                <MessageCircle size={16} /> Message
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-14 text-[var(--poke-text-muted)]">Loading...</div>
        ) : (
          <div className="space-y-6">
            <ItemCarousel items={postedItems} title="📦 Posted Items" />
            {isOwnProfile && (
              <>
                <ItemCarousel items={auctionItems} title="⚔️ In Auction" />
                <ItemCarousel items={claimedItems} title="📥 Claimed Items" />
                <ItemCarousel items={archivedItems} title="🗄️ CampusVault" />
              </>
            )}
            {!isOwnProfile && claimedItems.length > 0 && (
              <ItemCarousel items={claimedItems} title="📥 Claimed Items" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
