import { useEffect, useState, useRef } from "react";
import { Bell, X } from "lucide-react";
import { useNavigate } from "react-router";
import { mockApi } from "../lib/mockApi";
import { getTimeAgo } from "../lib/utils";

interface Notification {
  id: string;
  type: "claim_request" | "claim_approved" | "claim_rejected" | "unclaimed_alert";
  itemId: string;
  itemName: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    const handler = () => { fetchNotifications(); fetchUnreadCount(); };
    window.addEventListener("notificationsUpdated", handler);
    return () => window.removeEventListener("notificationsUpdated", handler);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    if (isOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const fetchNotifications = async () => setNotifications(await mockApi.getNotifications());
  const fetchUnreadCount = async () => setUnreadCount(await mockApi.getUnreadCount());

  const handleClick = async (n: Notification) => {
    if (!n.read) { await mockApi.markNotificationAsRead(n.id); fetchUnreadCount(); fetchNotifications(); }
    setIsOpen(false);
    const item = await mockApi.getItem(n.itemId);
    navigate(item?.status === "Auction" || item?.status === "Completed" ? `/auction/${n.itemId}` : `/item/${n.itemId}`);
  };

  const getIcon = (type: string) => ({ claim_request: "👋", claim_approved: "✅", claim_rejected: "❌", unclaimed_alert: "⏰" }[type] ?? "🔔");

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-white/70 hover:text-[#FFCB05] hover:bg-white/10 rounded-xl transition-all"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-[#E3350D] text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 z-50 max-h-[480px] flex flex-col animate-scaleIn origin-top-right"
          style={{ background: "linear-gradient(145deg, #1E2040 0%, #16183A 100%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,203,5,0.08)" }}>
          <div className="px-4 py-3.5 border-b border-white/[0.07] flex items-center justify-between shrink-0">
            <h3 className="font-black text-white text-sm" style={{ fontFamily: "Rajdhani, sans-serif", letterSpacing: "0.08em" }}>NOTIFICATIONS</h3>
            <button onClick={() => setIsOpen(false)} className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 scrollbar-hide">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <Bell size={36} className="mx-auto mb-3 text-white/15" />
                <p className="text-white/30 text-sm font-semibold">No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full px-4 py-3.5 text-left hover:bg-white/[0.05] transition-colors border-b border-white/[0.05] last:border-0 ${!n.read ? "bg-[#FFCB05]/[0.04]" : ""}`}
                  >
                    <div className="flex gap-3 items-start">
                      <span className="text-xl shrink-0 mt-0.5">{getIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-xs leading-relaxed mb-1">{n.message}</p>
                        <p className="text-white/30 text-xs font-semibold">{getTimeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="notif-dot shrink-0 mt-1.5" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
