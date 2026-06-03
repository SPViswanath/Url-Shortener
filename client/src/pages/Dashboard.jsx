import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as urlApi from "../services/urlApi";
import Navbar from "../components/layout/Navbar";
import { 
  Link2, BarChart2, Activity, Clock, Plus, 
  Search, Filter, LogOut
} from "lucide-react";
import toast from "react-hot-toast";

import CreateLinkModal from "../components/dashboard/CreateLinkModal";
import EditLinkModal from "../components/dashboard/EditLinkModal";
import ShareModal from "../components/dashboard/ShareModal";
import LinkRow from "../components/dashboard/LinkRow";
import BulkUploadModal from "../components/dashboard/BulkUploadModal";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'active', 'expired'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  
  // Modals state
  const [selectedEditUrl, setSelectedEditUrl] = useState(null);
  const [selectedShareUrl, setSelectedShareUrl] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    expiredLinks: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await urlApi.getUserUrls();
      const data = res.data || []; // Extract the array from the response object
      setUrls(data);
      
      // Calculate stats
      const totalClicks = data.reduce((sum, url) => sum + url.clickCount, 0);
      const now = new Date();
      const active = data.filter(url => !url.expiresAt || new Date(url.expiresAt) > now).length;
      
      setStats({
        totalLinks: data.length,
        totalClicks,
        activeLinks: active,
        expiredLinks: data.length - active
      });
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    try {
      await urlApi.deleteUrl(id);
      toast.success("Link deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete link");
    }
  };

  const filteredUrls = urls.filter(url => {
    const matchesSearch = url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          url.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (url.customAlias && url.customAlias.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    const now = new Date();
    const isActive = !url.expiresAt || new Date(url.expiresAt) > now;
    
    if (filterStatus === 'active') return isActive;
    if (filterStatus === 'expired') return !isActive;
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-12">
      <Navbar />
      
      {/* Dashboard Header */}
      <header className="bg-white border-b border-gray-200 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Dashboard</h1>
            <p className="mt-2 text-[var(--color-text-muted)]">Welcome back, {user?.name || "User"}! Here's how your links are performing.</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setIsBulkUploadModalOpen(true)}
              className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 bg-white font-semibold hover:bg-gray-50 flex items-center shadow-sm hover:shadow-md transition-all"
            >
              Bulk Import CSV
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-primary flex items-center shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create New Link
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Bento Grid Stats - 2x2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-[var(--color-primary)]/10 flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl"></div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Links</h3>
              <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                <Link2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-4xl font-bold text-gray-900">{loading ? "-" : stats.totalLinks}</p>
              {/* Visualization Circle */}
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-blue-500 transition-all duration-1000 delay-500 ease-out" strokeDasharray="125" strokeDashoffset={loading ? 125 : Math.max(0, 125 - (stats.totalLinks * 5))} />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-[var(--color-primary)]/10 flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-primary)] rounded-l-2xl"></div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Clicks</h3>
              <div className="p-2 bg-[#e07a5f]/10 rounded-lg group-hover:bg-[#e07a5f]/20 transition-colors">
                <BarChart2 className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-4xl font-bold text-gray-900">{loading ? "-" : stats.totalClicks}</p>
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[var(--color-primary)] transition-all duration-1000 delay-[600ms] ease-out" strokeDasharray="125" strokeDashoffset={loading ? 125 : Math.max(0, 125 - (stats.totalClicks * 2))} />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-[var(--color-primary)]/10 flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-accent)] rounded-l-2xl"></div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active Links</h3>
              <div className="p-2 bg-[#81b29a]/10 rounded-lg group-hover:bg-[#81b29a]/20 transition-colors">
                <Activity className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-4xl font-bold text-gray-900">{loading ? "-" : stats.activeLinks}</p>
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[var(--color-accent)] transition-all duration-1000 delay-[700ms] ease-out" strokeDasharray="125" strokeDashoffset={loading ? 125 : (stats.totalLinks > 0 ? 125 - (125 * (stats.activeLinks / stats.totalLinks)) : 125)} />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-sm border border-[var(--color-primary)]/10 flex flex-col hover:-translate-y-1 transition-transform relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gray-400 rounded-l-2xl"></div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Expired Links</h3>
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-4xl font-bold text-gray-900">{loading ? "-" : stats.expiredLinks}</p>
              <div className="relative w-12 h-12">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-100" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-400 transition-all duration-1000 delay-[800ms] ease-out" strokeDasharray="125" strokeDashoffset={loading ? 125 : (stats.totalLinks > 0 ? 125 - (125 * (stats.expiredLinks / stats.totalLinks)) : 125)} />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Links List Section (Transparent Background) */}
        <div className="bg-transparent mt-12 mb-4 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mb-6">
            <h2 className="text-xl font-bold text-[var(--color-secondary)]">Your Links</h2>
            
            <div className="flex space-x-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-3 pr-8 py-2 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all appearance-none text-sm font-medium text-gray-700"
                >
                  <option value="all">All Links</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <Filter className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-sm">Loading your links...</div>
            ) : filteredUrls.length > 0 ? (
              filteredUrls.map(url => (
                <LinkRow 
                  key={url.id} 
                  url={url} 
                  onDelete={() => handleDelete(url.id)} 
                  onEdit={() => setSelectedEditUrl(url)}
                  onShare={() => setSelectedShareUrl(url)}
                  onUpdate={fetchData}
                />
              ))
            ) : (
              <div className="p-16 flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-sm border border-[var(--color-primary)]/10">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <Link2 className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-[var(--color-secondary)] mb-2">No links found</h3>
                <p className="text-[var(--color-text-muted)] max-w-sm mb-6">
                  {searchQuery ? "No links match your search query." : "You haven't created any shortened links yet. Get started by creating your first link!"}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-primary"
                  >
                    Create Your First Link
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {isCreateModalOpen && (
        <CreateLinkModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={fetchData}
        />
      )}

      {isBulkUploadModalOpen && (
        <BulkUploadModal 
          isOpen={isBulkUploadModalOpen} 
          onClose={() => setIsBulkUploadModalOpen(false)} 
          onSuccess={fetchData}
        />
      )}
      
      <EditLinkModal 
        isOpen={!!selectedEditUrl} 
        onClose={() => setSelectedEditUrl(null)} 
        url={selectedEditUrl}
        onUpdate={fetchData}
      />
      
      <ShareModal 
        isOpen={!!selectedShareUrl} 
        onClose={() => setSelectedShareUrl(null)} 
        url={selectedShareUrl}
      />
    </div>
  );
}
