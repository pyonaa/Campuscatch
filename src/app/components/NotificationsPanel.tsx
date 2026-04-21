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
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    const data = await mockApi.getNotifications();
    setNotifications(data);
  };

  const fetchUnreadCount = async () => {
    const count = await mockApi.getUnreadCount();
    setUnreadCount(count);
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await mockApi.markNotificationAsRead(notification.id);
      fetchUnreadCount();
      fetchNotifications();
    }
    setIsOpen(false);
    const item = await mockApi.getItem(notification.itemId);
    if (item?.status === "Auction" || item?.status === "Completed") {
      navigate(`/auction/${notification.itemId}`);
    } else {
      navigate(`/item/${notification.itemId}`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "claim_request": return "👋";
      case "claim_approved": return "✅";
      case "claim_rejected": return "❌";
      case "unclaimed_alert": return "⏰";
      default: return "🔔";
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-xl border border-[var(--poke-border)] z-50 max-h-[480px] overflow-hidden flex flex-col"
          style={{ background: "var(--poke-surface)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
          <div className="p-4 border-b border-[var(--poke-border)] flex items-center justify-between">
            <h3 className="font-bold text-sm text-[var(--poke-text)]">Notifications</h3>
            <button onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-[var(--poke-surface-2)] rounded-lg transition-colors text-[var(--poke-text-muted)]">
              <X size={16} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={40} className="mx-auto mb-3 text-[var(--poke-text-dim)]" />
                <p className="text-sm text-[var(--poke-text-muted)]">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--poke-border)]">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full p-4 text-left transition-colors ${
                      !notification.read
                        ? "bg-[rgba(21,101,192,0.12)] hover:bg-[rgba(21,101,192,0.18)]"
                        : "hover:bg-[var(--poke-surface-2)]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="text-xl flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--poke-text)] mb-0.5 leading-snug">{notification.message}</p>
                        <p className="text-xs text-[var(--poke-text-dim)]">{getTimeAgo(notification.createdAt)}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-[var(--poke-blue-light)] rounded-full flex-shrink-0 mt-1.5" />
                      )}
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
