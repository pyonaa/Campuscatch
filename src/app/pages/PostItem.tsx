import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Upload, X, Zap } from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";
import { useAuth } from "../context/AuthContext";
import { mockApi } from "../lib/mockApi";

export default function PostItem() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    location: "",
    dateFound: "",
    description: "",
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
            setImageFiles([...imageFiles, ...compressedFiles]);
            setImagePreviews([...imagePreviews, ...previews]);
            setIsCompressing(false);
          }
        };
        reader.readAsDataURL(compressed);
      }
    } catch { toast.error("Error compressing images"); setIsCompressing(false); }
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

  return (
    <div className="min-h-screen">
      <header className="navbar-poke sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center gap-3">
          <button
            onClick={() => navigate("/home")}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black tracking-wider text-white" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            POST ITEM
          </h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header banner */}
        <div className="hero-poke rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm font-bold text-white/70 uppercase tracking-widest mb-1">New Discovery</p>
            <h2 className="text-2xl font-black" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
              Report a Found Item
            </h2>
            <p className="text-white/60 text-sm mt-1">Help reunite lost items with their trainers!</p>
          </div>
        </div>

        <div className="card-minimal p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2">Item Name</label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className="input-poke"
                placeholder="e.g., Blue Backpack"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-poke"
                  required
                >
                  <option value="">Select type</option>
                  <option value="electronics">⚡ Electronics</option>
                  <option value="bags">🎒 Bags</option>
                  <option value="clothing">👕 Clothing</option>
                  <option value="books">📚 Books</option>
                  <option value="accessories">💎 Accessories</option>
                  <option value="other">🔮 Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-2">Date Found</label>
                <input
                  type="date"
                  value={formData.dateFound}
                  onChange={(e) => setFormData({ ...formData, dateFound: e.target.value })}
                  className="input-poke"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Location Found</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-poke"
                required
              >
                <option value="">Select location</option>
                <option value="library">📚 Library</option>
                <option value="student-center">🏛️ Student Center</option>
                <option value="gym">🏋️ Gym</option>
                <option value="cafeteria">🍽️ Cafeteria</option>
                <option value="classroom">🎓 Classroom</option>
                <option value="parking">🚗 Parking Lot</option>
                <option value="other">📍 Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-poke resize-none"
                rows={4}
                placeholder="Describe the item in detail — color, brand, condition..."
                required
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="block mb-2">
                Photos
                <span className="text-white/30 font-normal ml-2 text-xs">({imagePreviews.length}/5)</span>
              </label>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden group aspect-square">
                      <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imagePreviews.length < 5 && (
                <label className={`upload-zone-poke ${isCompressing ? "opacity-50 pointer-events-none" : ""}`}>
                  <Upload className="mx-auto mb-2 text-[#FFCB05]/60" size={28} />
                  <p className="text-white/60 text-sm font-semibold">
                    {isCompressing ? "Compressing images..." : "Click to upload photos"}
                  </p>
                  <p className="text-white/30 text-xs mt-1">PNG, JPG up to 10MB</p>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={isCompressing}
                  />
                </label>
              )}
            </div>

            <button
              type="submit"
              className="btn-poke-primary w-full flex items-center justify-center gap-2 py-4 text-base mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="pokeball-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                  Posting...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Post Item
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
