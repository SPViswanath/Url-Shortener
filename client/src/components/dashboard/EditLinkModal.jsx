/**
 * EditLinkModal.jsx
 * 
 * Modal component to edit an existing URL's destination or expiration date.
 */
import { useState, useEffect } from "react";
import { X, Link2, Type, Calendar } from "lucide-react";
import * as urlApi from "../../services/urlApi";
import toast from "react-hot-toast";

export default function EditLinkModal({ isOpen, onClose, url, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    if (url && isOpen) {
      setOriginalUrl(url.originalUrl || "");
      setTitle(url.title || "");
      
      if (url.expiresAt) {
        // Convert to local datetime-local format
        const date = new Date(url.expiresAt);
        const formatted = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setExpiresAt(formatted);
      } else {
        setExpiresAt("");
      }
    }
  }, [url, isOpen]);

  if (!isOpen || !url) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) {
      toast.error("Original URL is required");
      return;
    }

    try {
      setLoading(true);
      const urlData = { originalUrl, title };
      if (expiresAt) {
        urlData.expiresAt = new Date(expiresAt).toISOString();
      } else {
        urlData.expiresAt = null; // Remove expiry
      }

      await urlApi.updateUrl(url.id, urlData);
      toast.success("Link updated successfully!");
      onUpdate();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-secondary)]">Edit Link</h2>
              <p className="text-gray-500 mt-1">Update the destination or expiration date.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination URL *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Link2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com/very/long/path"
                  required
                  className="pl-11 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Type className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Awesome Campaign"
                  className="pl-11 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiration Date (Optional)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="pl-11 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="pt-6 flex items-center justify-end space-x-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !originalUrl}
                className="btn-primary px-8 py-2.5 rounded-xl"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
