import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '48px 0 24px',
      marginTop: 'auto'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '32px',
          marginBottom: '36px'
        }}>
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0d9488, #0284c7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Activity size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Medi<span style={{ color: '#0d9488' }}>Connect</span>
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Empowering patient-doctor care through intelligent appointment management and secure AI-assisted medical document summarization.
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: '#0f172a' }}>Platform Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
              <li><Link to="/doctors">Find a Doctor</Link></li>
              <li><Link to="/patient/register">Patient Registration</Link></li>
              <li><Link to="/doctor/register">Join as a Healthcare Provider</Link></li>
              <li><Link to="/role-selection">Account Sign In</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: '#0f172a' }}>Privacy & Security</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#64748b', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#0d9488" />
                <span>Patient-Controlled Data Sharing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#0d9488" />
                <span>Encrypted Private File Vault</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#0d9488" />
                <span>Verified Medical Credentials</span>
              </div>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '14px', color: '#0f172a' }}>Contact & Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: '#64748b' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} /> support@mediconnect.local
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} /> +1 (800) 555-MEDI
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} /> Seattle, WA & San Francisco, CA
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          borderTop: '1px solid #f1f5f9',
          paddingTop: '20px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.8rem',
          lineHeight: '1.5'
        }}>
          <p style={{ marginBottom: '6px' }}>
            <strong>Clinical Notice:</strong> MediConnect AI summaries are generated solely to assist licensed healthcare providers in reviewing documented medical history. Summaries do not diagnose disease, prescribe treatment, or substitute for independent clinical judgment.
          </p>
          <p>© {new Date().getFullYear()} MediConnect Healthcare Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
