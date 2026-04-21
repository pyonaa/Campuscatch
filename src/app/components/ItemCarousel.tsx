import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import { formatLocation, getTimeAgo } from "../lib/utils";

interface Item {
  id: string; name: string; location: string; imageUrls?: string[];
  status: string; createdAt: string; dateFound: string;
}

interface ItemCarouselProps { items: Item[]; title: string; }

export default function ItemCarousel({ items, title }: ItemCarouselProps) {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) { el.addEventListener("scroll", checkScroll); return () => el.removeEventListener("scroll", checkScroll); }
  }, [items]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const getStatusClass = (status: string) => ({
    Available: "badge-available", Pending: "badge-pending", Returned: "badge-returned",
    Auction: "badge-auction", Completed: "badge-completed",
  }[status] ?? "badge-returned");

  if (items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-black text-white text-base" style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.04em" }}>
          {title}
        </h3>
        <div className="flex gap-1.5">
          {[{ dir: "left" as const, can: canScrollLeft }, { dir: "right" as const, can: canScrollRight }].map(({ dir, can }) => (
            <button key={dir} onClick={() => scroll(dir)} disabled={!can}
              className={`p-1.5 rounded-xl transition-all ${can
                ? "bg-white/10 text-white hover:bg-[#E3350D] hover:text-white"
                : "bg-white/[0.04] text-white/20 cursor-not-allowed"}`}>
              {dir === "left" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(item.status === "Auction" || item.status === "Completed" ? `/auction/${item.id}` : `/item/${item.id}`)}
            className="pokeball-card flex-shrink-0 w-64 cursor-pointer snap-start"
          >
            <div className="relative h-40 overflow-hidden bg-[#0F0F23]">
              <img
                src={item.imageUrls?.[0] || "https://via.placeholder.com/400x300/1E2040/FFCB05?text=?"}
                alt={item.name}
                className="w-full h-full object-cover opacity-80 hover:opacity-95 transition-opacity duration-300"
              />
              <div className="absolute top-2.5 right-2.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusClass(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
            <div className="p-3.5">
              <h4 className="font-extrabold text-white text-sm mb-1.5 truncate">{item.name}</h4>
              <div className="flex items-center gap-1 text-white/40 text-xs mb-1 truncate">
                <MapPin size={11} className="shrink-0" />{formatLocation(item.location)}
              </div>
              <div className="flex items-center gap-1 text-white/30 text-xs">
                <Clock size={11} className="shrink-0" />{getTimeAgo(item.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
