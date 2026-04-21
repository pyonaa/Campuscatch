/**
 * DEMO ONLY — DemoModeButton
 *
 * Visible only when VITE_DEMO_MODE=true (or the app is running on localhost).
 * Injects a simulated "2-month unclaimed" notification for presentation purposes.
 * Does NOT modify any real createdAt dates or real notification logic.
 */
import { useState } from "react";
import { useNavigate } from "react-router";
import { Zap } from "lucide-react";
import { mockApi } from "../lib/mockApi";
import { toast } from "sonner";

const IS_DEMO =
  import.meta.env.VITE_DEMO_MODE === "true" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export default function DemoModeButton() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!IS_DEMO) return null;

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const result = await mockApi.simulateDemoUnclaimedNotification();
      if (!result) {
        toast.error("No eligible items found for demo simulation.");
        return;
      }
      // Notify NotificationsPanel to refresh
      window.dispatchEvent(new Event("notificationsUpdated"));
      toast.success(
        "🎮 Demo notification injected! Check the bell icon.",
        { description: "Click the notification to navigate to the item." }
      );
      // Navigate to the item details page automatically
      navigate(`/item/${result.itemId}`);
    } catch (err) {
      console.error("[DemoMode] Simulation error:", err);
      toast.error("Demo simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleSimulate}
        disabled={loading}
        title="Simulate 2-Month Unclaimed Notification (Demo Mode)"
        className="
          flex items-center gap-1.5
          px-2.5 py-1.5
          rounded-xl
          text-[11px] font-black tracking-wider uppercase
          border border-orange-500/40
          text-orange-400
          hover:text-orange-300
          hover:bg-orange-500/15
          hover:border-orange-400/60
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        "
        style={{ background: "rgba(234,88,12,0.08)" }}
      >
        <Zap size={12} className={loading ? "animate-pulse" : ""} />
        <span className="hidden sm:inline">{loading ? "Simulating…" : "Simulate 2-Month"}</span>
        <span className="sm:hidden">{loading ? "…" : "2M"}</span>
      </button>
      {/* Tooltip label */}
      <span
        className="
          pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2
          whitespace-nowrap text-[10px] font-bold
          px-2 py-0.5 rounded-md
          bg-black/80 text-orange-300 border border-orange-500/30
          opacity-0 group-hover:opacity-100 transition-opacity
          z-50
        "
      >
        🎮 Demo Mode
      </span>
    </div>
  );
}
