import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail } from 'lucide-react';
import authService from '../services/authService';
import Notification from '../components/Notification';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@mediconnect.local');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login({
        email,
        password,
        requestedRole: 'admin'
      });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '440px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <span className="role-badge" style={{ background: '#eff6ff', color: '#1e40af' }}>
              Restricted Area
            </span>
            <h1>MediConnect Admin</h1>
            <p>Platform compliance and provider credential verification</p>
          </div>

          <Notification type="error" message={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Administrator Email</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Security Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '10px', background: 'linear-gradient(135deg, #1e40af, #0284c7)' }}>
              {loading ? 'Verifying...' : 'Access Administrator Console'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
