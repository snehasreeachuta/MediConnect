import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, Shield, ArrowRight } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="auth-page">
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '10px' }}>Welcome to MediConnect</h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem' }}>
            Please select how you would like to continue to access the platform.
          </p>
        </div>

        <div className="role-selection-grid">
          {/* Patient Option */}
          <div className="role-card" onClick={() => navigate('/patient/login')}>
            <div className="role-icon-box">
              <User size={36} />
            </div>
            <h3>Continue as Patient</h3>
            <p>
              Book doctor consultations, manage your health history, securely upload medical records, and review AI summaries.
            </p>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
              Patient Portal <ArrowRight size={16} />
            </button>
          </div>

          {/* Doctor Option */}
          <div className="role-card" onClick={() => navigate('/doctor/login')}>
            <div className="role-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Stethoscope size={36} />
            </div>
            <h3>Continue as Doctor</h3>
            <p>
              Manage patient consultations, review AI-synthesized clinical histories, organize working schedule, and record notes.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto', borderColor: '#0284c7', color: '#0284c7' }}>
              Doctor Portal <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Admin Portal Shortcut */}
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <button
            onClick={() => navigate('/admin/login')}
            style={{
              background: 'transparent',
              color: '#64748b',
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px'
            }}
          >
            <Shield size={14} /> Administrator Access Portal
          </button>
        </div>
      </div>
    </div>
  );
}
