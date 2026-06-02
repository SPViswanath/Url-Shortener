import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, MousePointerClick, Calendar, Globe, Monitor, 
  Smartphone, Tablet, Clock, Link2, ExternalLink, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { format, formatDistanceToNow } from 'date-fns';
import api from '../services/api';
import './Analytics.css';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [dailyClicks, setDailyClicks] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [analyticsRes, dailyRes] = await Promise.all([
        api.get(`/analytics/${id}`),
        api.get(`/analytics/${id}/daily?days=30`)
      ]);
      
      setData(analyticsRes.data.data);
      setDailyClicks(dailyRes.data.data.dailyClicks);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading analytics...</div>;
  }

  if (!data) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>URL not found.</div>;
  }

  const { url, analytics } = data;
  const { browserStats, osStats, deviceStats, recentVisits, totalClicks, lastVisited } = analytics;

  // Formatting Recharts tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label">{format(new Date(label), 'MMM dd, yyyy')}</p>
          <p className="value">{payload[0].value} click{payload[0].value !== 1 ? 's' : ''}</p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label" style={{ textTransform: 'capitalize' }}>{payload[0].name || 'Unknown'}</p>
          <p className="value">{payload[0].value} click{payload[0].value !== 1 ? 's' : ''}</p>
        </div>
      );
    }
    return null;
  };

  const getDeviceIcon = (deviceStr) => {
    const d = deviceStr?.toLowerCase() || '';
    if (d.includes('mobile')) return <Smartphone size={16} />;
    if (d.includes('tablet')) return <Tablet size={16} />;
    return <Monitor size={16} />;
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
      
      {/* ── Header ── */}
      <div className="analytics-header">
        <div className="analytics-header-top">
          <Link to="/dashboard" className="back-btn" title="Back to Dashboard">
            <ArrowLeft size={20} />
          </Link>
          <h1>Link Analytics</h1>
        </div>
        
        <div className="url-preview-card">
          {url.title && (
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              {url.title}
            </h2>
          )}
          <div className="short-url-row">
            <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="short-url">
              {url.shortUrl.replace(/^https?:\/\//, '')}
              <ExternalLink size={18} />
            </a>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Created {format(new Date(url.createdAt), 'MMM dd, yyyy')}
            </span>
          </div>
          <span className="original-url" style={{ cursor: 'default' }}>
            <Link2 size={14} style={{ display: 'inline', marginRight: '0.25rem', verticalAlign: 'text-bottom' }} />
            {url.originalUrl}
          </span>
        </div>
      </div>

      <div className="analytics-grid">
        
        {/* ── Top Metric Cards (col-span-4 x 3) ── */}
        <div className="bento-card col-span-4">
          <div className="bento-card-header">
            <h3 className="bento-card-title"><MousePointerClick size={18} /> Total Clicks</h3>
          </div>
          <div className="metric-highlight">
            <div className="value">{totalClicks}</div>
            <div className="label">Lifetime Clicks</div>
            <div className="trend positive">+ Active Tracking</div>
          </div>
        </div>

        <div className="bento-card col-span-4">
          <div className="bento-card-header">
            <h3 className="bento-card-title"><Calendar size={18} /> 30-Day Activity</h3>
          </div>
          <div className="metric-highlight">
            <div className="value">
              {dailyClicks.reduce((sum, day) => sum + day.clicks, 0)}
            </div>
            <div className="label">Clicks in last 30 days</div>
          </div>
        </div>

        <div className="bento-card col-span-4">
          <div className="bento-card-header">
            <h3 className="bento-card-title"><Clock size={18} /> Last Visited</h3>
          </div>
          <div className="metric-highlight">
            <div className="value" style={{ fontSize: '1.75rem' }}>
              {lastVisited ? formatDistanceToNow(new Date(lastVisited), { addSuffix: true }) : 'Never'}
            </div>
            <div className="label">{lastVisited ? format(new Date(lastVisited), 'MMM dd, yyyy - HH:mm') : 'No clicks yet'}</div>
          </div>
        </div>

        {/* ── Trend Chart (col-span-12) ── */}
        <div className="bento-card col-span-12">
          <div className="bento-card-header">
            <h3 className="bento-card-title"><Activity size={18} /> Click Traffic (Last 30 Days)</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyClicks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(tick) => format(new Date(tick), 'MMM dd')}
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="var(--accent-primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorClicks)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Breakdown 1: Browsers (col-span-4) ── */}
        <div className="bento-card col-span-4">
          <div className="bento-card-header">
            <h3 className="bento-card-title"><Globe size={18} /> Browsers</h3>
          </div>
          {browserStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', height: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className="chart-container small">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={browserStats} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="count" nameKey="_id">
                      {browserStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="dist-list">
                {browserStats.map((stat, i) => (
                  <div key={i} className="dist-item">
                    <div className="dist-label">
                      <div className="dist-icon" style={{ backgroundColor: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}>
                        <Globe size={16} />
                      </div>
                      {stat._id || 'Unknown'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="dist-value">{stat.count}</span>
                      <span className="dist-percent">{Math.round((stat.count / totalClicks) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No data yet</div>
          )}
        </div>

        {/* ── Breakdown 2: Devices (col-span-4) ── */}
        <div className="bento-card col-span-4">
          <div className="bento-card-header">
            <h3 className="bento-card-title"><Monitor size={18} /> Devices</h3>
          </div>
          {deviceStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', height: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className="chart-container small">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceStats} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="count" nameKey="_id">
                      {deviceStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="dist-list">
                {deviceStats.map((stat, i) => (
                  <div key={i} className="dist-item">
                    <div className="dist-label">
                      <div className="dist-icon" style={{ backgroundColor: `${COLORS[(i + 1) % COLORS.length]}20`, color: COLORS[(i + 1) % COLORS.length] }}>
                        {getDeviceIcon(stat._id)}
                      </div>
                      {stat._id || 'Unknown'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="dist-value">{stat.count}</span>
                      <span className="dist-percent">{Math.round((stat.count / totalClicks) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No data yet</div>
          )}
        </div>
        
        {/* ── Breakdown 3: Platforms (col-span-4) ── */}
        <div className="bento-card col-span-4">
          <div className="bento-card-header">
            <h3 className="bento-card-title"><Smartphone size={18} /> Platforms</h3>
          </div>
          {osStats.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem', height: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className="chart-container small">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={osStats} cx="50%" cy="50%" innerRadius={40} outerRadius={55} paddingAngle={5} dataKey="count" nameKey="_id">
                      {osStats.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="dist-list">
                {osStats.map((stat, i) => (
                  <div key={i} className="dist-item">
                    <div className="dist-label">
                      <div className="dist-icon" style={{ backgroundColor: `${COLORS[(i + 2) % COLORS.length]}20`, color: COLORS[(i + 2) % COLORS.length] }}>
                        <Monitor size={16} />
                      </div>
                      {stat._id || 'Unknown'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="dist-value">{stat.count}</span>
                      <span className="dist-percent">{Math.round((stat.count / totalClicks) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>No data yet</div>
          )}
        </div>

        {/* ── Recent Clicks Table (col-span-12) ── */}
        <div className="bento-card col-span-12">
          <div className="bento-card-header" style={{ marginBottom: 0 }}>
            <h3 className="bento-card-title"><Clock size={18} /> Recent Clicks Log (Last 10)</h3>
            <Link to={`/analytics/${id}/history`} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-primary)' }}>View All</Link>
          </div>
          
          {recentVisits.length > 0 ? (
            <div className="clicks-table-wrap" style={{ margin: '1rem -1.5rem -1.5rem -1.5rem' }}>
              <table className="clicks-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Device</th>
                    <th>Browser</th>
                    <th>OS</th>
                    <th>Referrer</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisits.map((visit, i) => (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 500 }}>{formatDistanceToNow(new Date(visit.timestamp), { addSuffix: true })}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{format(new Date(visit.timestamp), 'MMM dd, HH:mm')}</div>
                      </td>
                      <td>
                        <span className={`device-badge ${visit.device?.toLowerCase() || 'desktop'}`}>
                          {getDeviceIcon(visit.device)} {visit.device || 'Desktop'}
                        </span>
                      </td>
                      <td>{visit.browser || 'Unknown'}</td>
                      <td>{visit.os || 'Unknown'}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {visit.referrer || 'Direct'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>No clicks to display.</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Analytics;
