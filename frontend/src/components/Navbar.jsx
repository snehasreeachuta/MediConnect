import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User, LogOut, Calendar, FileText, Shield } from 'lucide-react';
import authService from '../services/authService';

export default function Navbar() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px'
      }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0d9488, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Activity size={22} />
          </div>
          <span style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: '#0f172a',
            letterSpacing: '-0.5px'
          }}>
            Medi<span style={{ color: '#0d9488' }}>Connect</span>
          </span>
        </Link>

        {/* Center Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ fontWeight: 600, color: '#334155' }}>Home</Link>
          <Link to="/doctors" style={{ fontWeight: 600, color: '#334155' }}>Find Doctors</Link>
          
          {user && user.role === 'patient' && (
            <>
              <Link to="/patient/dashboard" style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={16} /> Dashboard
              </Link>
              <Link to="/patient/records" style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileText size={16} /> My Records
              </Link>
            </>
          )}

          {user && user.role === 'doctor' && (
            <Link to="/doctor/dashboard" style={{ fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={16} /> Doctor Dashboard
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin/dashboard" style={{ fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Shield size={16} /> Admin Portal
            </Link>
          )}
        </div>

        {/* Right Auth controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span className="badge badge-teal">{user.role}</span>
                {user.fullName || user.email}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/role-selection" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/role-selection" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
