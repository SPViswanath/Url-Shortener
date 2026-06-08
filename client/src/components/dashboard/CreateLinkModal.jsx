/**
 * CreateLinkModal.jsx
 * 
 * Modal component for creating a new shortened URL.
 * Also handles QR code generation and sharing for the new link.
 */
import { useState, useEffect } from "react";
import { X, Link2, Calendar, Wand2, Download, Copy, Check, Share2, QrCode } from "lucide-react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import * as urlApi from "../../services/urlApi";

export default function CreateLinkModal({ isOpen, onClose, onSuccess, initialUrl = "" }) {
  const [step, setStep] = useState(1); // 1: Form, 2: Success/QR
  const [loading, setLoading] = useState(false);
  const [createdUrl, setCreatedUrl] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [generatingQr, setGeneratingQr] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [originalUrl, setOriginalUrl] = useState(initialUrl);
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5000";

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (initialUrl && !originalUrl) {
        setOriginalUrl(initialUrl);
      }
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialUrl]);

  // Generate QR manually
  const handleGenerateQR = () => {
    if (!createdUrl) return;
    setGeneratingQr(true);
    const shortLink = `${baseUrl}/${createdUrl.shortCode}`;
    
    // Simulate loading for effect
    setTimeout(() => {
      QRCode.toDataURL(shortLink, { width: 300, margin: 2, color: { dark: '#2b2d42', light: '#ffffff' } })
        .then(url => {
          setQrCodeUrl(url);
          setGeneratingQr(false);
        })
        .catch(err => {
          console.error("QR Code Error:", err);
          setGeneratingQr(false);
        });
    }, 800);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;

    try {
      setLoading(true);
      const urlData = { originalUrl, title };
      if (expiresAt) urlData.expiresAt = new Date(expiresAt).toISOString();

      const newUrl = await urlApi.createUrl(urlData);
      setCreatedUrl(newUrl.data);
      setStep(2); // Move to success step
      toast.success("Link created successfully!");
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create short link");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdUrl) return;
    const shortLink = `${baseUrl}/${createdUrl.shortCode}`;
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement("a");
    a.href = qrCodeUrl;
    a.download = `qrcode-${createdUrl.shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareLink = async () => {
    if (!createdUrl) return;
    const shortLink = `${baseUrl}/${createdUrl.shortCode}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Short URL', url: shortLink });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      handleCopy();
    }
  };

  const handleShareQR = async () => {
    if (!qrCodeUrl || !navigator.share) return;
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'QR Code',
          text: 'Here is my shortened link QR code!'
        });
      }
    } catch (err) {
      console.error("Error sharing QR:", err);
    }
  };

  const resetForm = () => {
    setOriginalUrl(initialUrl);
    setTitle("");
    setExpiresAt("");
    setCreatedUrl(null);
    setQrCodeUrl("");
    setGeneratingQr(false);
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-secondary)]/60 backdrop-blur-sm transition-all duration-300">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Panel: Form or Success Details */}
        <div className="w-full md:w-3/5 p-8 md:p-10 flex flex-col relative bg-white">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors md:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {step === 1 ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--color-text-main)] mb-2">Create new link</h2>
                <p className="text-[var(--color-text-muted)] text-sm">Shorten a long URL, set a custom alias, or add an expiration date.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination URL <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Link2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      placeholder="https://example.com/very/long/path"
                      className="pl-11 w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title (Optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Summer Campaign 2026"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-sm"
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

                <div className="pt-4 flex items-center justify-end space-x-3 mt-auto">
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
                    {loading ? "Creating..." : "Create Link"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            // Success State - Left Panel
            <div className="flex flex-col h-full justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-[var(--color-text-main)] mb-2">Link Created!</h2>
              <p className="text-[var(--color-text-muted)] mb-8">Your shortened URL is ready to be shared with the world.</p>
              
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between mb-8">
                <span className="text-lg font-medium text-gray-800 truncate pr-4">
                  {baseUrl}/{createdUrl?.shortCode}
                </span>
                <button 
                  onClick={handleCopy}
                  className={`flex-shrink-0 p-2.5 rounded-lg transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex flex-col space-y-3 mt-auto">
                {!qrCodeUrl && !generatingQr && (
                  <button 
                    onClick={handleGenerateQR}
                    className="w-full py-3 rounded-xl border-2 border-[var(--color-primary)] text-[var(--color-primary)] font-bold hover:bg-[#e07a5f]/5 transition-colors"
                  >
                    Generate QR Code
                  </button>
                )}
                
                <div className="flex justify-center space-x-8 py-4">
                  <div className="flex flex-col items-center">
                    <button 
                      onClick={handleShareLink}
                      className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors shadow-sm mb-2"
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                    <span className="text-xs font-medium text-gray-600">Share Link</span>
                  </div>
                  {qrCodeUrl && (
                    <div className="flex flex-col items-center">
                      <button 
                        onClick={handleShareQR}
                        className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 transition-colors shadow-sm mb-2"
                      >
                        <QrCode className="w-6 h-6" />
                      </button>
                      <span className="text-xs font-medium text-gray-600">Share QR</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button 
                    onClick={resetForm}
                    className="flex-1 py-3 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Create Another
                  </button>
                  <button 
                    onClick={onClose}
                    className="flex-1 btn-primary py-3 rounded-xl text-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Informational / QR Code */}
        <div className="hidden md:flex md:w-2/5 bg-[var(--color-background)] p-10 flex-col relative overflow-hidden border-l border-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f4f1de]/50 to-[#e07a5f]/10"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-gray-500 hover:text-[var(--color-secondary)] hover:bg-white/50 rounded-full transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col h-full items-center justify-center text-center">
            {step === 1 ? (
              <>
                <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-white">
                  <Wand2 className="w-10 h-10 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-3">Keep it short</h3>
                <p className="text-gray-600">
                  Shortened URLs are memorable, easy to share, and they allow you to track powerful analytics.
                </p>
              </>
            ) : generatingQr ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mb-4"></div>
                <p className="text-[var(--color-text-main)] font-medium">Generating QR...</p>
              </div>
            ) : qrCodeUrl ? (
              <>
                <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-6">QR Code Ready</h3>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-white mb-6">
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                </div>
                <button 
                  onClick={handleDownloadQR}
                  className="flex items-center text-sm font-medium text-[var(--color-primary)] hover:text-[#c5654c] transition-colors bg-white px-5 py-2.5 rounded-full shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </button>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-white/60 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-white">
                  <Wand2 className="w-10 h-10 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-3">Maximize your reach</h3>
                <p className="text-gray-600">
                  Generate a QR code for your new link to bridge the physical and digital world instantly.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
