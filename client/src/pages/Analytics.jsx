import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, MousePointerClick, Calendar, Clock, 
  Globe, Monitor, Smartphone, LayoutDashboard, Copy, Check, ExternalLink, MapPin
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { format } from "date-fns";
import { io } from "socket.io-client";

import Navbar from "../components/layout/Navbar";
import * as urlApi from "../services/urlApi";

const COLORS = ['#2b2d42', '#e07a5f', '#81b29a', '#f2cc8f', '#3d405b'];

export default function Analytics() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [data, setData] = useState({
    url: null,
    analytics: null,
    dailyClicks: [],
    history: [],
    totalHistoryClicks: 0
  });
  const [copied, setCopied] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => setShowLoading(true), 300);
    } else {
      setShowLoading(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    const fetchAllData = async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        const [analyticsRes, dailyRes, historyRes] = await Promise.all([
          urlApi.getAnalytics(id),
          urlApi.getDailyClicks(id),
          urlApi.getClickHistory(id, 1, 10)
        ]);

        setData({
          url: analyticsRes.data.url,
          analytics: analyticsRes.data.analytics,
          dailyClicks: dailyRes.data.dailyClicks,
          history: historyRes.data.clicks,
          totalHistoryClicks: historyRes.data.pagination?.totalClicks || 0
        });
      } catch (err) {
        if (!silent) toast.error("Failed to load analytics data");
        console.error(err);
      } finally {
        if (!silent) setLoading(false);
      }
    };
    
    fetchAllData();

    // Socket.io Setup
    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5000";
    const newSocket = io(socketUrl, { withCredentials: true });
    
    newSocket.on("connect", () => {
      newSocket.emit("join_url_room", id);
    });

    newSocket.on("new_click", () => {
      toast.success("New click recorded! Updating analytics...", {
        icon: '⚡',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      fetchAllData(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  const handleViewAllHistory = async () => {
    try {
      setLoadingMore(true);
      setShowAllHistory(true);
      const res = await urlApi.getClickHistory(id, 1, 1000); // Fetch up to 1000 clicks
      setData(prev => ({
        ...prev,
        history: res.data.clicks
      }));
    } catch (err) {
      toast.error("Failed to load full history");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCopy = () => {
    if (data.url) {
      navigator.clipboard.writeText(data.url.shortUrl);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    if (!showLoading) {
      return (
        <div className="min-h-screen bg-[var(--color-background)]">
          <Navbar />
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data.url) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Link Not Found</h2>
          <Link to="/dashboard" className="text-[var(--color-primary)] hover:underline flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { url, analytics, dailyClicks, history } = data;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
          <p className="font-semibold text-gray-800 mb-1">{format(new Date(label), "MMM d, yyyy")}</p>
          <p className="text-[var(--color-primary)] font-medium">
            {payload[0].value} clicks
          </p>
        </div>
      );
    }
    return null;
  };

  const renderPieChart = (statsData) => {
    if (!statsData || statsData.length === 0) {
      return <div className="h-48 flex items-center justify-center text-gray-400">No data available</div>;
    }
    return (
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={statsData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            dataKey="count"
            nameKey="_id"
          >
            {statsData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [`${value} clicks`, '']}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderStatsList = (statsData) => {
    if (!statsData || statsData.length === 0) return null;
    return (
      <div className="mt-4 space-y-3">
        {statsData.slice(0, 4).map((item, index) => (
          <div key={item._id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
              <span className="text-sm font-medium text-gray-700 capitalize">{item._id || 'Unknown'}</span>
            </div>
            <span className="text-sm text-gray-500">{item.count}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* Header & Navigation */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/dashboard" className="text-gray-500 hover:text-[var(--color-secondary)] transition-colors flex items-center font-medium">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Link Overview Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-sm border border-[var(--color-primary)]/10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[var(--color-secondary)] truncate mb-2">
              {url.title || url.customAlias || url.shortCode}
            </h1>
            <a 
              href={url.shortUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center text-lg font-medium text-[var(--color-primary)] hover:underline mb-3"
            >
              {url.shortUrl}
              <ExternalLink className="w-4 h-4 ml-1.5" />
            </a>
            <p className="text-gray-500 text-sm truncate max-w-2xl flex items-center">
              <Globe className="w-4 h-4 mr-1.5 opacity-60" />
              {url.originalUrl}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleCopy}
              className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-colors border ${copied ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <div className="bg-[#e07a5f]/10 text-[var(--color-primary)] px-6 py-3 rounded-xl font-bold flex items-center justify-center border border-[#e07a5f]/20">
              <MousePointerClick className="w-5 h-5 mr-2" />
              {analytics.totalClicks} Total Clicks
            </div>
          </div>
        </div>

        {/* Main Analytics Grid - Cinematic Stacked Layout */}
        <div className="flex flex-col gap-6 lg:gap-8">
          
          {/* Timeline Chart - Full Width */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[var(--color-primary)]/5 flex flex-col animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-[var(--color-secondary)]">Click Traffic</h2>
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Last 30 Days</span>
            </div>
            
            <div className="w-full mt-4 h-64 sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyClicks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="var(--color-primary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorClicks)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device, Platform & Location Breakdown - 3 Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-primary)]/5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center mb-4">
                <Monitor className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-base font-bold text-[var(--color-secondary)]">Browsers</h3>
              </div>
              {renderPieChart(analytics.browserStats)}
              {renderStatsList(analytics.browserStats)}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-primary)]/5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center mb-4">
                <Smartphone className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-base font-bold text-[var(--color-secondary)]">Devices & OS</h3>
              </div>
              {renderPieChart(analytics.osStats)}
              {renderStatsList(analytics.osStats)}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[var(--color-primary)]/5 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center mb-4">
                <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                <h3 className="text-base font-bold text-[var(--color-secondary)]">Locations</h3>
              </div>
              {renderPieChart(analytics.locationStats)}
              {renderStatsList(analytics.locationStats)}
            </div>
          </div>

          {/* Recent Clicks Log */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[var(--color-primary)]/5 mt-2 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--color-secondary)]">Recent Clicks Log</h2>
              {!showAllHistory && data.totalHistoryClicks > 0 ? (
                <button 
                  onClick={handleViewAllHistory}
                  disabled={loadingMore}
                  className="px-4 py-1.5 bg-[var(--color-primary)] text-white hover:bg-[#c5654c] font-medium rounded-lg text-sm shadow-sm transition-colors flex items-center"
                >
                  {loadingMore ? "Loading..." : "View All"}
                </button>
              ) : (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {showAllHistory ? `All ${history.length} visits` : "No visits yet"}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500">
                    <th className="pb-3 font-medium px-4">Date & Time</th>
                    <th className="pb-3 font-medium px-4">Location</th>
                    <th className="pb-3 font-medium px-4">Browser</th>
                    <th className="pb-3 font-medium px-4">OS / Device</th>
                    <th className="pb-3 font-medium px-4">Referrer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history && history.length > 0 ? (
                    history.map((click, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-4 px-4 text-sm text-gray-800 whitespace-nowrap">
                          {format(new Date(click.timestamp), "MMM d, yyyy • h:mm a")}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 capitalize">
                          {click.city !== 'Unknown' ? `${click.city}, ` : ''}{click.country}
                        </td>
                        <td className="py-4 px-4 text-sm font-medium text-gray-700 capitalize">
                          {click.browser || "Unknown"}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 capitalize">
                          {click.os || "Unknown"} {click.device !== 'desktop' ? `(${click.device})` : ''}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-500 truncate max-w-xs">
                          {click.referrer && click.referrer !== 'Direct' ? (
                            <a href={click.referrer} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)] hover:underline">
                              {click.referrer}
                            </a>
                          ) : (
                            "Direct"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">
                        No clicks recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
}
