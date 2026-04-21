import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
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
      await mockApi.submitClaim(id, {
        whenLost: formData.whenLost,
        uniqueDetail: formData.uniqueDetail,
      });
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

  const labelClass = "block text-xs font-bold text-[var(--poke-text-muted)] uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen">
      <header className="navbar-poke sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate(`/item/${id}`)} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl text-white font-bold tracking-wide">Claim Item</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="card-poke p-6">
          <p className="text-sm text-[var(--poke-text-muted)] mb-6 leading-relaxed">
            Provide details to verify ownership of this item.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>
                When did you lose it? <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={formData.whenLost}
                onChange={(e) => setFormData({ ...formData, whenLost: e.target.value })}
                className="input-poke w-full"
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Unique identifying detail <span className="text-red-400">*</span>
              </label>
              <textarea
                value={formData.uniqueDetail}
                onChange={(e) => setFormData({ ...formData, uniqueDetail: e.target.value })}
                className="input-poke w-full resize-none"
                rows={5}
                placeholder="Describe something unique about the item that proves it's yours (e.g., 'Has a small keychain with my initials', 'Lock screen is a photo of a golden retriever')"
                required
              />
              <p className="text-xs text-[var(--poke-text-dim)] mt-2">
                This helps the owner verify you're the rightful owner.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-poke-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Claim"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
