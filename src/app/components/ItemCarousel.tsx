import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { formatLocation, getTimeAgo } from "../lib/utils";

interface Item {
  id: string;
  name: string;
  location: string;
  imageUrls?: string[];
  status: string;
  category?: string;
  createdAt: string;
  dateFound: string;
}

interface ItemCarouselProps {
  items: Item[];
  title: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  electronics: "📱", bags: "🎒", clothing: "👕",
  books: "📚", accessories: "⌚", other: "📦",
};

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
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" });
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

  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-[var(--poke-text-muted)] uppercase tracking-wider">{title}</h3>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`p-1.5 rounded-full transition-all ${
              canScrollLeft
                ? "bg-[var(--poke-surface-2)] text-[var(--poke-text-muted)] hover:text-[var(--poke-blue-light)] border border-[var(--poke-border)]"
                : "bg-[var(--poke-surface-2)] text-[var(--poke-text-dim)] cursor-not-allowed border border-transparent opacity-40"
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`p-1.5 rounded-full transition-all ${
              canScrollRight
                ? "bg-[var(--poke-surface-2)] text-[var(--poke-text-muted)] hover:text-[var(--poke-blue-light)] border border-[var(--poke-border)]"
                : "bg-[var(--poke-surface-2)] text-[var(--poke-text-dim)] cursor-not-allowed border border-transparent opacity-40"
            }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(
              item.status === "Auction" || item.status === "Completed"
                ? `/auction/${item.id}`
                : `/item/${item.id}`
            )}
            className="poke-item-card flex-shrink-0 w-56 snap-start"
          >
            <div className="h-32 bg-[#1a237e] relative overflow-hidden">
              {item.imageUrls?.[0] ? (
                <img src={item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">
                  {CATEGORY_EMOJI[item.category || "other"] || "📦"}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--poke-surface)] via-transparent to-transparent" />
            </div>
            <div className="p-3">
              <h4 className="font-bold text-xs text-[var(--poke-text)] mb-1 truncate">{item.name}</h4>
              <p className="text-xs text-[var(--poke-text-muted)] mb-2 truncate">📍 {formatLocation(item.location)}</p>
              <span className={getStatusBadge(item.status)}>{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
