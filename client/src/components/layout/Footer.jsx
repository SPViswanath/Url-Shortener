import React from 'react';
import { Link2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ 
      backgroundColor: 'var(--bg-secondary)', 
      borderTop: '1px solid var(--border)',
      padding: '2rem 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="brand-logo" style={{ fontSize: '1.25rem' }}>shortly</span>
        </div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} Shortly. Built for Katomaran Hackathon.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
