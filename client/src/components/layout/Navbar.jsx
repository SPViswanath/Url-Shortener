import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Link2, LogOut, User, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav style={{ 
      backgroundColor: 'var(--bg-secondary)', 
      borderBottom: '1px solid var(--border)',
      position: 'fixed',
      width: '100%',
      top: 0,
      zIndex: 50
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: '4rem' 
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="brand-logo">shortly</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <>
              <Link to="/dashboard" style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Dashboard</Link>
              <div className="profile-dropdown-container" ref={dropdownRef} style={{ marginLeft: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="hide-on-mobile" style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />
                </button>

                {isDropdownOpen && (
                  <div className="profile-dropdown-menu">
                    <div className="profile-dropdown-header">
                      <div className="name">{user.name}</div>
                      <div className="email">{user.email}</div>
                    </div>
                    <button className="profile-dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontWeight: 500 }}>Login</Link>
              <Link to="/signup" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
