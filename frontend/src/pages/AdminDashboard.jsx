import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle2, XCircle, AlertTriangle, Users, Stethoscope, Calendar, Award } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'suspended'

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsRes, statsRes] = await Promise.all([
        api.get('/admin/doctors'),
        api.get('/admin/stats')
      ]);
      setDoctors(docsRes.data.doctors || []);
      setStats(statsRes.data.stats || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/doctors/${id}/approve`);
      setMessage('Doctor credentials approved. Profile is now active.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve doctor.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this doctor application?')) return;
    try {
      await api.patch(`/admin/doctors/${id}/reject`);
      setMessage('Doctor application rejected.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject doctor.');
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Are you sure you want to suspend this doctor account?')) return;
    try {
      await api.patch(`/admin/doctors/${id}/suspend`);
      setMessage('Doctor account suspended.');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to suspend doctor.');
    }
  };

  const filteredDoctors = doctors.filter(d => {
    if (filter === 'pending') return d.verification_status === 'pending';
    if (filter === 'approved') return d.verification_status === 'approved';
    if (filter === 'suspended') return d.verification_status === 'suspended';
    return true;
  });

  if (loading) return <LoadingSpinner message="Loading administration console..." fullScreen />;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={24} color="#0284c7" />
              <h1>Administrator Compliance Console</h1>
            </div>
            <p>Verify medical credentials, review doctor licenses, and monitor platform activity.</p>
          </div>
        </div>

        <Notification type="success" message={message} onClose={() => setMessage(null)} />
        <Notification type="error" message={error} onClose={() => setError(null)} />

        {/* Admin Statistics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon amber">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {doctors.filter(d => d.verification_status === 'pending').length}
              </div>
              <div className="stat-label">Pending Verifications</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon teal">
              <Stethoscope size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {doctors.filter(d => d.verification_status === 'approved').length}
              </div>
              <div className="stat-label">Active Approved Doctors</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats?.total_appointments || 0}</div>
              <div className="stat-label">Total Appointments Booked</div>
            </div>
          </div>
        </div>

        {/* Doctor Verification Review List */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Provider Credential Verification Queue</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['all', 'pending', 'approved', 'suspended'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`btn btn-sm ${filter === tab ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map(doc => (
                <div key={doc.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{doc.full_name}</h3>
                      <span className={`badge ${
                        doc.verification_status === 'approved' ? 'badge-success' :
                        doc.verification_status === 'pending' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {doc.verification_status}
                      </span>
                    </div>

                    <div style={{ color: '#0d9488', fontWeight: 600, fontSize: '0.9rem', marginTop: '2px' }}>
                      {doc.specialization} • {doc.qualifications}
                    </div>

                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                      <strong>License:</strong> {doc.medical_license_number} • <strong>Experience:</strong> {doc.experience_years} years • <strong>Clinic:</strong> {doc.hospital_name} ({doc.city})
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {doc.verification_status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(doc.id)} className="btn btn-primary btn-sm">
                          <CheckCircle2 size={14} /> Approve Doctor
                        </button>
                        <button onClick={() => handleReject(doc.id)} className="btn btn-danger btn-sm">
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}

                    {doc.verification_status === 'approved' && (
                      <button onClick={() => handleSuspend(doc.id)} className="btn btn-secondary btn-sm" style={{ color: '#ef4444' }}>
                        Suspend Account
                      </button>
                    )}

                    {doc.verification_status === 'suspended' && (
                      <button onClick={() => handleApprove(doc.id)} className="btn btn-primary btn-sm">
                        Re-activate Account
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No doctor applications in this view.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
