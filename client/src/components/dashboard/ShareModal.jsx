/**
 * ShareModal.jsx
 * 
 * Modal component to easily share a shortened URL to social media, via QR code, or copy to clipboard.
 */
import { useState, useEffect } from "react";
import { X, Copy, Check, Download, QrCode, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";
import QRCode from "qrcode";

export default function ShareModal({ isOpen, onClose, url }) {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showQr, setShowQr] = useState(false);

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5000";
  const shortLink = url ? (url.shortUrl || `${baseUrl}/${url.shortCode}`) : "";

  useEffect(() => {
    if (isOpen && shortLink) {
      QRCode.toDataURL(shortLink, { width: 300, margin: 2, color: { dark: '#2b2d42', light: '#ffffff' } })
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error("QR Code Error:", err));
    }
  }, [isOpen, shortLink]);

  if (!isOpen || !url) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = url.title ? `Check out ${url.title}` : "Check out this link";

  const socialLinks = [
    { name: "WhatsApp", icon: "https://cdn-icons-png.flaticon.com/512/3670/3670051.png", url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shortLink)}` },
    { name: "Facebook", icon: "https://cdn-icons-png.flaticon.com/512/733/733547.png", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortLink)}` },
    { name: "X", icon: "https://cdn-icons-png.flaticon.com/512/5969/5969020.png", url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shortLink)}` },
    { name: "Email", icon: "https://cdn-icons-png.flaticon.com/512/732/732200.png", url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent("Here is the link: " + shortLink)}` }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: url.title || 'Short URL',
          url: shortLink,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      toast.error("Native share not supported in this browser");
    }
  };

  const handleShareQR = async () => {
    if (!qrCodeUrl || !navigator.share) {
      toast.error("Native sharing not supported or QR not ready");
      return;
    }
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const file = new File([blob], `qrcode-${url.shortCode}.png`, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'QR Code',
          text: shareText
        });
      } else {
        toast.error("Sharing files is not supported on this device");
      }
    } catch (err) {
      console.error("Error sharing QR:", err);
    }
  };

  const handleDownloadQR = () => {
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `qrcode-${url.shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[var(--color-secondary)]">Share your Link</h2>
            <button 
              onClick={onClose}
              className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!showQr ? (
            <>
              {/* Social Icons & Actions */}
              <div className="flex justify-center items-center space-x-4 sm:space-x-6 mb-8">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center space-y-2 group"
                  >
                    <div className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center bg-white group-hover:-translate-y-1 group-hover:shadow-md transition-all">
                      <img src={social.icon} alt={social.name} className="w-6 h-6 object-contain" />
                    </div>
                  </a>
                ))}

                {/* QR Code Action */}
                <button
                  onClick={handleShareQR}
                  className="flex flex-col items-center space-y-2 group outline-none"
                  title="Share QR Code"
                >
                  <div className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center bg-white group-hover:-translate-y-1 group-hover:shadow-md transition-all text-gray-700">
                    <QrCode className="w-5 h-5" />
                  </div>
                </button>

                {/* Native Share / More Options */}
                <button
                  onClick={handleNativeShare}
                  className="flex flex-col items-center space-y-2 group outline-none"
                  title="More Options"
                >
                  <div className="w-12 h-12 rounded-full border border-gray-100 shadow-sm flex items-center justify-center bg-white group-hover:-translate-y-1 group-hover:shadow-md transition-all text-gray-700">
                    <MoreHorizontal className="w-5 h-5" />
                  </div>
                </button>
              </div>

              {/* Copy Link Input */}
              <div className="flex items-center p-1.5 border border-gray-200 rounded-xl bg-gray-50">
                <input 
                  type="text"
                  value={shortLink}
                  readOnly
                  className="flex-1 bg-transparent px-3 text-sm text-gray-600 outline-none truncate"
                />
                <button 
                  onClick={handleCopy}
                  className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-primary)] hover:bg-gray-50 transition-colors flex items-center shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  Copy
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-gray-50 animate-pulse rounded-xl"></div>
                )}
              </div>
              <div className="flex space-x-3 w-full">
                <button 
                  onClick={() => setShowQr(false)}
                  className="flex-1 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  Back
                </button>
                <button 
                  onClick={handleDownloadQR}
                  className="flex-1 py-2.5 rounded-xl font-medium text-white bg-[var(--color-primary)] hover:bg-[#c5654c] transition-colors flex items-center justify-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
