import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, BarChart2, Edit3, Trash2, ExternalLink, Calendar, Check, Share2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function LinkRow({ url, onDelete, onEdit, onShare, onUpdate }) {
  const [copied, setCopied] = useState(false);
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5000";
  const shortLink = url.shortUrl || `${baseUrl}/${url.shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const isActive = !url.expiresAt || new Date(url.expiresAt) > new Date();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md border border-[var(--color-primary)]/5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group">
      
      {/* Left section: Link Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3 mb-1">
          <a 
            href={shortLink} 
            target="_blank" 
            rel="noreferrer"
            className="text-lg font-bold text-[var(--color-primary)] hover:underline truncate flex items-center"
          >
            {url.title || url.customAlias || url.shortCode}
            <ExternalLink className="w-4 h-4 ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isActive ? "Active" : "Expired"}
          </span>
        </div>
        
        <div className="text-sm text-gray-500 max-w-xl mb-3 flex items-center space-x-2 overflow-hidden">
          <span className="font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md text-xs flex-shrink-0">{shortLink}</span>
          <span className="truncate">{url.originalUrl}</span>
        </div>

        <div className="flex items-center text-xs text-gray-400 space-x-4">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            {format(new Date(url.createdAt), "MMM d, yyyy")}
          </div>
          <div className="flex items-center">
            <BarChart2 className="w-3.5 h-3.5 mr-1" />
            {url.clickCount} clicks
          </div>
        </div>
      </div>

      {/* Right section: Actions */}
      <div className="flex items-center space-x-2 mt-4 lg:mt-0">
        <button 
          onClick={handleCopy}
          className={`p-2 rounded-lg border transition-colors flex items-center justify-center ${copied ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]'}`}
          title="Copy Link"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>

        <button 
          onClick={onShare}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-purple-600 transition-colors flex items-center justify-center"
          title="Share Link"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <Link 
          to={`/analytics/${url.id}`}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center justify-center"
          title="View Analytics"
        >
          <BarChart2 className="w-4 h-4" />
        </Link>

        <button 
          onClick={onEdit}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-orange-500 transition-colors flex items-center justify-center"
          title="Edit Link"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button 
          onClick={onDelete}
          className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center"
          title="Delete Link"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
