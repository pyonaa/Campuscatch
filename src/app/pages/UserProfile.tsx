import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";
import { getInitials } from "../lib/utils";
import ItemCarousel from "../components/ItemCarousel";

interface Item {
  id: string; name: string; category: string; location: string; dateFound: string;
  description: string; status: string; imageUrls?: string[]; userId: string; userName: string; createdAt: string;
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

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        if (isOwnProfile) {
          const data = await mockApi.getMyItems();
          setPostedItems(data.posted || []);
          setClaimedItems(data.claimed || []);
          setArchivedItems(data.archived || []);
          const all = await mockApi.getAuctionItems();
          setAuctionItems(all.filter(i => i.userId === "mock-user-id"));
        } else if (userId) {
          const data = await mockApi.getUserItems(userId);
          setPostedItems(data.posted || []);
          setClaimedItems(data.claimed || []);
        }
      } catch (err) { console.error(err); }
      finally { setIsLoading(false); }
    };
    fetch();
  }, [userId]);

  return (
    <div className="min-h-screen">
      <header className="navbar-poke sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate("/home")} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black tracking-wider text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            {isOwnProfile ? "MY PROFILE" : "TRAINER PROFILE"}
          </h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile card */}
        <div className="card-minimal p-6 mb-6 animate-fadeIn">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white shrink-0 relative"
              style={{ background: "linear-gradient(135deg, #E3350D 0%, #B02800 100%)", boxShadow: "0 0 30px rgba(227,53,13,0.3)" }}>
              {getInitials(userName)}
              {/* Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/20" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-white mb-0.5">{userName}</h2>
              <p className="text-white/40 text-sm font-semibold">
                {postedItems.length} item{postedItems.length !== 1 ? "s" : ""} posted
              </p>
              <div className="flex gap-3 mt-3">
                <div className="text-center">
                  <p className="text-lg font-black text-white">{postedItems.length}</p>
                  <p className="text-xs text-white/30 font-semibold">Posted</p>
                </div>
                {isOwnProfile && (
                  <>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                      <p className="text-lg font-black text-white">{claimedItems.length}</p>
                      <p className="text-xs text-white/30 font-semibold">Claimed</p>
                    </div>
                    <div className="w-px bg-white/10" />
                    <div className="text-center">
                      <p className="text-lg font-black text-[#FFCB05]">{auctionItems.length}</p>
                      <p className="text-xs text-white/30 font-semibold">Auction</p>
                    </div>
                  </>
                )}
              </div>
            </div>
            {!isOwnProfile && (
              <button onClick={() => navigate("/messages/1")} className="btn-poke-ghost flex items-center gap-2 px-4 py-2.5 text-sm shrink-0">
                <MessageCircle size={16} /> Message
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="pokeball-spinner" /></div>
        ) : (
          <div className="space-y-6">
            <ItemCarousel items={postedItems} title="📦 Posted Items" />
            {isOwnProfile && (
              <>
                <ItemCarousel items={auctionItems} title="🔨 In Auction" />
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
