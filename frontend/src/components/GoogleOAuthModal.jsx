import React from 'react';
import { AlertCircle, Key, ExternalLink, X, CheckCircle2 } from 'lucide-react';

export default function GoogleOAuthModal({ isOpen, onClose, role, onMockLogin }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Key size={22} color="#0d9488" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 600 }}>
              Google OAuth Setup Required
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '75vh', overflowY: 'auto' }}>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', marginTop: 0 }}>
            Live Google Sign-In requires an active <strong>Google OAuth 2.0 Client ID</strong> registered in the Google Cloud Console.
          </p>

          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '14px 16px',
            marginBottom: '18px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.92rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Steps to Configure Real Google Sign-In:
            </h4>
            <ol style={{ margin: 0, paddingLeft: '20px', color: '#166534', fontSize: '0.86rem', lineHeight: '1.6' }}>
              <li>Open <strong>Google Cloud Console</strong> &gt; APIs & Services &gt; Credentials.</li>
              <li>Create an <strong>OAuth 2.0 Client ID</strong> (Application Type: <em>Web application</em>).</li>
              <li>Add <code>http://localhost:5173</code> to <strong>Authorized JavaScript origins</strong>.</li>
              <li>Add <code>http://localhost:5001/api/auth/google/callback</code> to <strong>Authorized redirect URIs</strong>.</li>
              <li>Set <code>VITE_GOOGLE_CLIENT_ID=&lt;your_client_id&gt;</code> in <code>frontend/.env</code>.</li>
              <li>Set <code>GOOGLE_CLIENT_ID=&lt;your_client_id&gt;</code> in <code>backend/.env</code>.</li>
              <li>Restart both frontend and backend servers.</li>
            </ol>
          </div>

          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '14px 16px',
            marginBottom: '16px'
          }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#1e40af' }}>
              Development Testing Mode
            </h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e3a8a', lineHeight: '1.5' }}>
              For local evaluation before configuring Google Cloud, you can test the authentication flow, JWT issuance, and {role === 'doctor' ? 'doctor' : 'patient'} profile creation using our simulated development credential.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            className="btn btn-outline"
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              onMockLogin();
            }}
            className="btn btn-primary"
            style={{ padding: '8px 18px', fontSize: '0.9rem' }}
          >
            Test Dev Google Flow ({role === 'doctor' ? 'Doctor' : 'Patient'})
          </button>
        </div>
      </div>
    </div>
  );
}
