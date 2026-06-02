import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, BarChart2, Zap, Shield } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 4rem - 100px)' }}>
      {/* Hero Section */}
      <section style={{ 
        padding: '6rem 0', 
        textAlign: 'center',
        background: 'linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%)'
      }}>
        <div className="container">
          <h1 className="hero-title" style={{ 
            fontSize: '3.5rem', 
            fontWeight: 800, 
            marginBottom: '1.5rem',
            lineHeight: 1.2
          }}>
            Shorten URLs.<br />
            <span style={{ 
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Track Every Click.</span>
          </h1>
          <p className="hero-subtitle" style={{ 
            fontSize: '1.25rem', 
            color: 'var(--text-secondary)', 
            maxWidth: '600px', 
            margin: '0 auto 2.5rem'
          }}>
            A premium URL shortener with powerful analytics. Transform your long, ugly links into clean, trackable short URLs.
          </p>
          <div>
            {user ? (
              <Link to="/dashboard" className="btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                Go to Dashboard
              </Link>
            ) : (
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/signup" className="btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                  Get Started for Free
                </Link>
                <Link to="/login" className="btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--bg-secondary)', flex: 1 }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            {/* Feature 1 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                width: '64px', height: '64px', 
                borderRadius: '50%', 
                background: 'var(--accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <Zap color="var(--accent-primary)" size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Lightning Fast</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Instantly shorten links and redirect users without any noticeable delay.</p>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                width: '64px', height: '64px', 
                borderRadius: '50%', 
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <BarChart2 color="var(--accent-secondary)" size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Rich Analytics</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Track total clicks, daily trends, and visitor device/browser statistics.</p>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ 
                width: '64px', height: '64px', 
                borderRadius: '50%', 
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem'
              }}>
                <Shield color="var(--success)" size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Secure & Reliable</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Your links are safe. We enforce HTTPs and offer link expiration controls.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
