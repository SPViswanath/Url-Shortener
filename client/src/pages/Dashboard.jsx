import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import {
  Plus, Link2, BarChart2, MousePointerClick, Activity,
  Copy, Edit2, Trash2, ExternalLink, Calendar, Clock,
  CheckCircle2, XCircle, X, Download, Share2, QrCode, Search, Filter, Mail
} from 'lucide-react';
import api from '../services/api';
import './Dashboard.css';

const FacebookIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const TwitterIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 12 3 12c.5.2 1 .2 1.5.1C2.5 11 1.5 8.5 2 6c.5.7 1.5 1.5 2.5 1.5-1.5-3.5.5-6.5 3-5 3.5 4 10.5 4.5 11.5 1.5Z"/>
  </svg>
);

const WhatsAppIcon = ({ size = 24, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

/* ─────────────────────────────────────────────────────
   DASHBOARD
   ───────────────────────────────────────────────────── */
const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  /* — Create modal — */
  const [createOpen, setCreateOpen] = useState(false);
  const [createPhase, setCreatePhase] = useState('form'); // form | success
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);

  /* — QR state inside create modal — */
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  /* — Edit modal — */
  const [editOpen, setEditOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editExpiresAt, setEditExpiresAt] = useState('');

  /* — Share modal — */
  const [shareModalUrl, setShareModalUrl] = useState(null);

  /* ── Fetch URLs ───────────────────────────────────── */
  const fetchUrls = useCallback(async () => {
    try {
      const res = await api.get('/urls');
      setUrls(res.data.data);
    } catch {
      toast.error('Failed to load your URLs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  /* ── Derived stats ────────────────────────────────── */
  const totalLinks = urls.length;
  const totalClicks = urls.reduce((s, u) => s + u.clickCount, 0);
  const activeLinks = urls.filter(u => !u.isExpired).length;
  const expiredLinks = urls.filter(u => u.isExpired).length;

  const filteredUrls = urls.filter(u => {
    const matchesSearch = (u.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.shortUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.originalUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' ? true :
                          filterStatus === 'active' ? !u.isExpired : u.isExpired;
    return matchesSearch && matchesFilter;
  });

  /* ── Handlers ─────────────────────────────────────── */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUrl) { toast.error('Please enter a URL'); return; }
    setCreating(true);
    try {
      const res = await api.post('/urls', {
        title: newTitle,
        originalUrl: newUrl,
        expiresAt: expiresAt || null,
      });
      const created = res.data.data;
      setUrls(prev => [created, ...prev]);
      setCreatedLink(created);
      setCreatePhase('success');
      // Only generate QR for the short URL if the user had already clicked 'Generate QR' in the form
      if (qrDataUrl) {
        generateQR(created.shortUrl);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setCreating(false);
    }
  };

  const resetCreateModal = () => {
    setCreateOpen(false);
    setCreatePhase('form');
    setNewTitle('');
    setNewUrl('');
    setExpiresAt('');
    setCreatedLink(null);
    setQrDataUrl(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link and all its analytics?')) return;
    try {
      await api.delete(`/urls/${id}`);
      setUrls(prev => prev.filter(u => u.id !== id));
      toast.success('URL deleted');
    } catch { toast.error('Failed to delete URL'); }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleShare = (shortUrl) => {
    setShareModalUrl(shortUrl);
  };

  const handleNativeShareQR = async (url) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'QR Code',
          text: 'Scan this QR code!'
        });
      } else {
        toast.error('Sharing images is not supported on this device');
      }
    } catch (err) {
      toast.error('Failed to generate and share QR');
    }
  };

  const shareQRImage = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      const file = new File([blob], 'qr-code.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'QR Code',
          text: 'Scan this QR code!'
        });
      } else {
        toast.error('Sharing images is not supported on this device');
      }
    } catch (err) {
      toast.error('Failed to share QR');
    }
  };

  /* ── QR generation ────────────────────────────────── */
  const generateQR = async (url) => {
    if (!url) return;
    setQrLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: { dark: '#1e293b', light: '#ffffff' },
      });
      setQrDataUrl(dataUrl);
    } catch {
      toast.error('QR generation failed');
    } finally {
      setQrLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `shortly-qr-${createdLink?.shortCode || 'code'}.png`;
    a.click();
  };

  /* ── Edit ──────────────────────────────────────────── */
  const openEdit = (url) => {
    setEditingUrl(url);
    setEditTitle(url.title || '');
    setEditOriginalUrl(url.originalUrl);
    setEditExpiresAt(url.expiresAt ? new Date(url.expiresAt).toISOString().slice(0, 16) : '');
    setEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/urls/${editingUrl.id}`, {
        title: editTitle,
        originalUrl: editOriginalUrl,
        expiresAt: editExpiresAt || null,
      });
      setUrls(prev => prev.map(u => u.id === editingUrl.id ? res.data.data : u));
      setEditOpen(false);
      toast.success('URL updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */
  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem' }}>

      {/* ── Header ─────────────────────────────────── */}
      <div className="dash-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Manage and track all your shortened links</p>
        </div>
        <button className="btn-create" onClick={() => setCreateOpen(true)}>
          <Plus size={18} /> New Link
        </button>
      </div>

      {/* ── Metrics ────────────────────────────────── */}
      <div className="metrics-row">
        <MetricTile accent="purple" icon={<Link2 size={18} />}  value={totalLinks}  label="Total Links" />
        <MetricTile accent="blue"   icon={<MousePointerClick size={18} />} value={totalClicks} label="Total Clicks" />
        <MetricTile accent="green"  icon={<Activity size={18} />} value={activeLinks} label="Active" />
        <MetricTile accent="amber"  icon={<Clock size={18} />}   value={expiredLinks} label="Expired" />
      </div>

      {/* ── Links ──────────────────────────────────── */}
      <div className="links-control-bar">
        <h2 className="section-heading" style={{ marginBottom: 0 }}>Your Links</h2>
        <div className="links-controls">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search links..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="filter-box">
            <Filter size={16} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Links</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading…</p>
      ) : urls.length === 0 ? (
        <div className="empty-state">
          <div className="icon-wrap"><Link2 size={24} color="var(--text-tertiary)" /></div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>No links yet</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Click <strong>"New Link"</strong> to shorten your first URL.
          </p>
        </div>
      ) : filteredUrls.length === 0 ? (
        <div className="empty-state">
          <div className="icon-wrap"><Search size={24} color="var(--text-tertiary)" /></div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>No results found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="links-list">
          {filteredUrls.map(url => (
            <div key={url.id} className="link-row">
              <div className="link-info">
                {url.title && <div className="link-title">{url.title}</div>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="link-short">
                    {url.shortUrl.replace(/^https?:\/\//, '')}
                    <ExternalLink size={14} />
                  </a>
                  <span className={`badge ${url.isExpired ? 'badge-expired' : 'badge-active'}`}>
                    {url.isExpired
                      ? <><XCircle size={12}/> Expired</>
                      : <><CheckCircle2 size={12}/> Active</>}
                  </span>
                </div>
                <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="link-original">
                  {url.originalUrl}
                </a>
                <div className="link-meta">
                  <span><BarChart2 size={14} /> {url.clickCount}</span>
                  <span><Calendar size={14} /> {new Date(url.createdAt).toLocaleDateString()}</span>
                  {url.expiresAt && (
                    <span style={{ color: url.isExpired ? 'var(--error)' : undefined }}>
                      <Clock size={14} /> {new Date(url.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="actions">
                <button onClick={() => handleCopy(url.shortUrl)} className="action-btn" title="Copy URL"><Copy size={16} /></button>
                <button onClick={() => handleShare(url.shortUrl)} className="action-btn" title="Share URL"><Share2 size={16} /></button>
                <Link to={`/analytics/${url.id}`} className="action-btn" title="Analytics"><BarChart2 size={16} /></Link>
                <button onClick={() => openEdit(url)} className="action-btn" title="Edit"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(url.id)} className="action-btn danger" title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          CREATE MODAL
          ═══════════════════════════════════════════════ */}
      {createOpen && (
        <div className="modal-backdrop" onClick={resetCreateModal}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{createPhase === 'form' ? 'Create New Link' : 'Link Created!'}</h2>
              <button className="modal-close" onClick={resetCreateModal}><X size={18} /></button>
            </div>

            {createPhase === 'form' ? (
              /* ── Form Phase ─────────────────────────── */
              <div className="create-layout">
                <form onSubmit={handleCreate} className="create-form-col">
                  <div className="field">
                    <label>Title (optional)</label>
                    <input type="text" placeholder="e.g. My Portfolio" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Destination URL</label>
                    <input type="url" placeholder="https://example.com/long-url" value={newUrl} onChange={e => setNewUrl(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Expiry (optional)</label>
                    <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
                  </div>
                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={resetCreateModal}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={creating}
                      style={{ padding: '0.6rem 1.25rem' }}>
                      {creating ? 'Creating…' : 'Shorten URL'}
                    </button>
                  </div>
                </form>

                {/* QR Panel */}
                <div className="create-qr-col">
                  {qrDataUrl ? (
                    <div className="qr-preview-wrap">
                      <img src={qrDataUrl} alt="QR Code" width={200} height={200} />
                      <div className="qr-actions">
                        <button type="button" className="qr-btn" onClick={downloadQR}><Download size={14} /> Save</button>
                        <button type="button" className="qr-btn" onClick={() => handleCopy(newUrl)}><Copy size={14} /> Copy URL</button>
                      </div>
                    </div>
                  ) : (
                    <div className="qr-placeholder">
                      <div className="qr-ghost"><QrCode size={32} /></div>
                      <span>Enter a URL and generate a QR code</span>
                      <button
                        type="button"
                        className="qr-btn"
                        disabled={!newUrl || qrLoading}
                        onClick={() => generateQR(newUrl)}
                      >
                        <QrCode size={14} /> {qrLoading ? 'Generating…' : 'Generate QR'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Success Phase ──────────────────────── */
              <div className="success-panel">
                <div className="success-icon"><CheckCircle2 size={28} /></div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Your link is ready</h3>

                <div className="success-url-box">
                  <span>{createdLink?.shortUrl}</span>
                  <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <button className="action-btn" onClick={() => handleCopy(createdLink?.shortUrl)} title="Copy URL">
                      <Copy size={16} />
                    </button>
                    <button className="action-btn" onClick={() => handleShare(createdLink?.shortUrl)} title="Share URL">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                {qrDataUrl ? (
                  <div className="qr-preview-wrap" style={{ marginTop: '0.5rem' }}>
                    <img src={qrDataUrl} alt="QR Code" width={200} height={200} />
                    <div className="qr-actions">
                      <button className="qr-btn" onClick={downloadQR}><Download size={14} /> Save QR</button>
                      <button className="qr-btn" onClick={shareQRImage}><Share2 size={14} /> Share QR</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={() => generateQR(createdLink?.shortUrl)}>
                    <QrCode size={14} style={{ marginRight: '0.5rem' }} /> Generate QR
                  </button>
                )}

                <div className="success-actions" style={{ marginTop: '1rem' }}>
                  <button className="btn-secondary" onClick={resetCreateModal}>Done</button>
                  <button className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}
                    onClick={() => {
                      setCreatePhase('form');
                      setNewTitle('');
                      setNewUrl('');
                      setExpiresAt('');
                      setQrDataUrl(null);
                      setCreatedLink(null);
                    }}>
                    Create Another
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          EDIT MODAL
          ═══════════════════════════════════════════════ */}
      {editOpen && (
        <div className="modal-backdrop" onClick={() => setEditOpen(false)}>
          <div className="modal-panel narrow" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Link</h2>
              <button className="modal-close" onClick={() => setEditOpen(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit}>
                <div className="field">
                  <label>Title (optional)</label>
                  <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                </div>
                <div className="field">
                  <label>Destination URL</label>
                  <input type="url" value={editOriginalUrl} onChange={e => setEditOriginalUrl(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Expiry (optional)</label>
                  <input type="datetime-local" value={editExpiresAt} onChange={e => setEditExpiresAt(e.target.value)} />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setEditOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Share Modal ─────────────────────────────────── */}
      {shareModalUrl && (
        <div className="modal-backdrop" onClick={() => setShareModalUrl(null)}>
          <div className="modal-panel" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share your Link</h2>
              <button className="modal-close" onClick={() => setShareModalUrl(null)}><X size={18} /></button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareModalUrl)}`, '_blank')}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WhatsAppIcon size={24} color="#25D366" /></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>WhatsApp</span>
                </button>
                <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareModalUrl)}`, '_blank')}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FacebookIcon size={24} color="#1877F2" /></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Facebook</span>
                </button>
                <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareModalUrl)}`, '_blank')}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TwitterIcon size={24} color="#000000" /></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>X</span>
                </button>
                <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => window.open(`mailto:?subject=Check this out&body=${encodeURIComponent(shareModalUrl)}`)}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={24} color="#EA4335" /></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Email</span>
                </button>
                <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => handleNativeShareQR(shareModalUrl)}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><QrCode size={24} color="var(--accent-primary)" /></div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Share QR</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem' }}>
                <span style={{ flex: 1, textAlign: 'left', fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingLeft: '0.5rem' }}>{shareModalUrl}</span>
                <button className="btn-secondary" style={{ padding: '0.4rem 1rem' }} onClick={() => handleCopy(shareModalUrl)}>Copy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════ */
const MetricTile = ({ accent, icon, value, label }) => (
  <div className={`metric-tile ${accent}`}>
    <div className="metric-accent" />
    <div className="metric-icon">{icon}</div>
    <div className="metric-value">{value}</div>
    <div className="metric-label">{label}</div>
  </div>
);

export default Dashboard;
