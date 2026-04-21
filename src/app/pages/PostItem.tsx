import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";

export default function PostItem() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    itemName: "", category: "", location: "", dateFound: "", description: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (imageFiles.length + files.length > 5) { toast.error("Maximum 5 images allowed"); return; }
    setIsCompressing(true);
    try {
      const compressedFiles: File[] = [];
      const previews: string[] = [];
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} is too large (max 10MB)`); continue; }
        const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
        compressedFiles.push(compressed);
        const reader = new FileReader();
        reader.onloadend = () => {
          previews.push(reader.result as string);
          if (previews.length === compressedFiles.length) {
            setImageFiles(prev => [...prev, ...compressedFiles]);
            setImagePreviews(prev => [...prev, ...previews]);
            setIsCompressing(false);
          }
        };
        reader.readAsDataURL(compressed);
      }
    } catch {
      toast.error("Error compressing images");
      setIsCompressing(false);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const uploadData = await mockApi.uploadImage(file);
        imageUrls.push(uploadData.url);
      }
      await mockApi.createItem({
        name: formData.itemName,
        category: formData.category,
        location: formData.location,
        dateFound: formData.dateFound,
        description: formData.description,
        imageUrls,
      });
      toast.success("Item posted successfully!");
      setTimeout(() => navigate("/home"), 1000);
    } catch (error) {
      console.error("Error posting item:", error);
      toast.error("Failed to post item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = "input-poke w-full";
  const labelClass = "block text-xs font-bold text-[var(--poke-text-muted)] uppercase tracking-wider mb-2";

  return (
    <div className="min-h-screen">
      <header className="navbar-poke sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/home")} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl text-white font-bold tracking-wide">Report a Find</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="card-poke p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelClass}>Item Name</label>
              <input type="text" value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className={fieldClass} placeholder="e.g., Blue Backpack" required />
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <select value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className={fieldClass} required>
                <option value="">Select a category</option>
                <option value="electronics">Electronics</option>
                <option value="bags">Bags & Backpacks</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books & Stationery</option>
                <option value="accessories">Accessories</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Location Found</label>
              <select value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={fieldClass} required>
                <option value="">Select a location</option>
                <option value="library">Library</option>
                <option value="student-center">Student Center</option>
                <option value="gym">Gym</option>
                <option value="cafeteria">Cafeteria</option>
                <option value="classroom">Classroom</option>
                <option value="parking">Parking Lot</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Date Found</label>
              <input type="date" value={formData.dateFound}
                onChange={(e) => setFormData({ ...formData, dateFound: e.target.value })}
                className={fieldClass} required />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-poke w-full resize-none" rows={4}
                placeholder="Describe the item in detail..." required />
            </div>

            <div>
              <label className={labelClass}>Upload Images (Max 5)</label>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden group">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover" />
                      <button type="button" onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {imagePreviews.length < 5 && (
                <label className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isCompressing
                    ? "opacity-50 cursor-not-allowed border-[var(--poke-border)]"
                    : "border-[var(--poke-border)] hover:border-[var(--poke-blue-light)] hover:bg-[var(--poke-surface-2)]"
                }`}>
                  <Upload className="mx-auto mb-3 text-[var(--poke-text-dim)]" size={28} />
                  <p className="text-sm text-[var(--poke-text-muted)]">
                    {isCompressing ? "Compressing..." : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-[var(--poke-text-dim)] mt-1">
                    PNG, JPG up to 10MB • {imagePreviews.length}/5 uploaded
                  </p>
                  <input type="file" className="hidden" accept="image/*" multiple
                    onChange={handleImageChange} disabled={isCompressing} />
                </label>
              )}
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-poke-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? "Submitting..." : "Post Item"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
