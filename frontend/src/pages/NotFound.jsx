import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px'
    }}>
      <div className="container" style={{ maxWidth: '500px' }}>
        <h1 style={{ fontSize: '5rem', fontWeight: 900, color: '#0d9488', lineHeight: 1 }}>404</h1>
        <h2 style={{ fontSize: '1.75rem', margin: '14px 0 8px' }}>Page Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '28px' }}>
          The page or medical record you are attempting to access does not exist or may have been relocated.
        </p>
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Return to Home
        </Link>
      </div>
    </div>
  );
}
