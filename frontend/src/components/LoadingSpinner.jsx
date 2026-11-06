import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading...', fullScreen = false }) {
  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: '12px',
      color: '#0d9488'
    }}>
      <Loader2 size={36} className="spin-animation" style={{
        animation: 'spin 1s linear infinite'
      }} />
      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#475569' }}>
        {message}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {content}
      </div>
    );
  }

  return content;
}
