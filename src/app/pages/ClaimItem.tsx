import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { mockApi } from "../lib/mockApi";

export default function ClaimItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({ whenLost: "", uniqueDetail: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    try {
      await mockApi.submitClaim(id, formData);
      window.dispatchEvent(new Event("itemUpdated"));
      window.dispatchEvent(new Event("notificationsUpdated"));
      toast.success("Claim submitted! The item owner will be notified.");
      setTimeout(() => navigate(`/item/${id}`), 1000);
    } catch {
      toast.error("Failed to submit claim. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="navbar-poke sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button onClick={() => navigate(`/item/${id}`)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black tracking-wider text-white" style={{ fontFamily: "Rajdhani, sans-serif" }}>
            CLAIM ITEM
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Banner */}
        <div className="hero-poke rounded-2xl p-6 mb-6 text-white">
          <div className="relative z-10 flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Target size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black" style={{ fontFamily: "Rajdhani, sans-serif" }}>Prove Ownership</h2>
              <p className="text-white/60 text-sm">Provide details to verify this item is yours</p>
            </div>
          </div>
        </div>

        <div className="card-minimal p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2">When did you lose it? <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={formData.whenLost}
                onChange={(e) => setFormData({ ...formData, whenLost: e.target.value })}
                className="input-poke"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Unique identifying detail <span className="text-red-400">*</span></label>
              <textarea
                value={formData.uniqueDetail}
                onChange={(e) => setFormData({ ...formData, uniqueDetail: e.target.value })}
                className="input-poke resize-none"
                rows={5}
                placeholder="Describe something unique that proves it's yours (e.g., 'Has a small keychain with my initials', 'Lock screen photo of a golden retriever', 'Sticker on the back corner')"
                required
              />
              <p className="text-xs text-white/30 mt-2 font-semibold">
                This helps the owner verify you are the rightful trainer of this item.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-poke-primary w-full py-4 flex items-center justify-center gap-2 text-base"
            >
              {isSubmitting ? (
                <><div className="pokeball-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Submitting...</>
              ) : (
                <><Zap size={18} /> Submit Claim</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
