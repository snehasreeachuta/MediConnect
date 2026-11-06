import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';
import authService from '../services/authService';
import Notification from '../components/Notification';
import GoogleOAuthModal from '../components/GoogleOAuthModal';

export default function PatientLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const from = location.state?.from?.pathname || '/patient/dashboard';

  useEffect(() => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          try {
            setLoading(true);
            await authService.googleLogin(response.credential, 'patient');
            navigate(from, { replace: true });
          } catch (err) {
            setError(err.response?.data?.message || 'Google authentication failed.');
          } finally {
            setLoading(false);
          }
        }
      });
    }
  }, [googleClientId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.login({
        email,
        password,
        requestedRole: 'patient'
      });
      navigate(from, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to MediConnect server. Please ensure the backend is running on port 5001.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setShowOAuthModal(true);
    }
  };

  const handleMockGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await authService.googleLogin('mock_google_id_token_patient', 'patient');
      navigate(from, { replace: true });
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to MediConnect server. Please ensure the backend is running on port 5001.');
      } else {
        setError(err.response?.data?.message || 'Google Sign-In failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('patient@mediconnect.local');
    setPassword('Patient@123456');
  };

  return (
    <div className="auth-page">
      <GoogleOAuthModal
        isOpen={showOAuthModal}
        onClose={() => setShowOAuthModal(false)}
        role="patient"
        onMockLogin={handleMockGoogleLogin}
      />

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="role-badge">Patient Access</span>
            <h1>Patient Sign In</h1>
            <p>Access your appointments and health summaries</p>
          </div>

          <Notification type="error" message={error} onClose={() => setError(null)} />

          {/* Google Sign In */}
          <button onClick={handleGoogleClick} type="button" className="btn-google">
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">
            <span>or sign in with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In as Patient'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div style={{
            marginTop: '20px',
            padding: '10px 14px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.82rem',
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Sample Patient: patient@mediconnect.local</span>
            <button
              type="button"
              onClick={fillDemoAccount}
              style={{
                background: 'transparent',
                color: '#0d9488',
                fontWeight: 700,
                fontSize: '0.8rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Autofill
            </button>
          </div>

          <div className="auth-footer">
            Don't have an account? <Link to="/patient/register">Create a new account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
