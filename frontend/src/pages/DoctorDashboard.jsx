import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle2, AlertCircle, FileCheck, Shield, Users, User, ArrowRight, Settings } from 'lucide-react';
import authService from '../services/authService';
import appointmentService from '../services/appointmentService';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DoctorDashboard() {
  const user = authService.getCurrentUser();
  const doctor = user?.profile;
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'today', 'pending', 'completed'

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const list = await appointmentService.getMyAppointments();
      setAppointments(list || []);
    } catch (err) {
      console.error('Error loading doctor appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await appointmentService.updateStatus(id, newStatus);
      loadAppointments();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to update status to ${newStatus}.`);
    }
  };

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().slice(0, 10);
    return dateStr.slice(0, 10) === today;
  };

  const filteredAppointments = appointments.filter(a => {
    if (filterTab === 'today') return isToday(a.appointment_datetime);
    if (filterTab === 'confirmed') return a.appointment_status === 'confirmed';
    if (filterTab === 'completed') return a.appointment_status === 'completed';
    if (filterTab === 'cancelled') return a.appointment_status === 'cancelled';
    return true;
  });

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Verification Status Warning if pending */}
        {doctor && doctor.verification_status === 'pending' && (
          <div className="alert alert-info" style={{ marginBottom: '28px' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Profile Verification Pending:</strong> Your credentials are currently under administrative review. Your profile will be published to public doctor search once verified.
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-title">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1>{user?.fullName || 'Doctor'} Dashboard</h1>
              {doctor && (
                <span className={`badge ${doctor.verification_status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                  {doctor.verification_status}
                </span>
              )}
            </div>
            <p>{doctor?.specialization} • {doctor?.hospital_name}</p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/doctor/profile" className="btn btn-secondary btn-sm">
              <Settings size={15} /> Edit Schedule & Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon teal">
              <Calendar size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {appointments.filter(a => isToday(a.appointment_datetime)).length}
              </div>
              <div className="stat-label">Today's Patients</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Users size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {appointments.filter(a => a.appointment_status === 'confirmed').length}
              </div>
              <div className="stat-label">Confirmed Upcoming</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <FileCheck size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {appointments.filter(a => a.records_uploaded && a.consent_granted).length}
              </div>
              <div className="stat-label">AI Summaries Shared</div>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="dashboard-section">
          <div className="tab-nav">
            <button
              onClick={() => setFilterTab('all')}
              className={`tab-btn ${filterTab === 'all' ? 'active' : ''}`}
            >
              All Appointments ({appointments.length})
            </button>
            <button
              onClick={() => setFilterTab('today')}
              className={`tab-btn ${filterTab === 'today' ? 'active' : ''}`}
            >
              Today ({appointments.filter(a => isToday(a.appointment_datetime)).length})
            </button>
            <button
              onClick={() => setFilterTab('confirmed')}
              className={`tab-btn ${filterTab === 'confirmed' ? 'active' : ''}`}
            >
              Confirmed ({appointments.filter(a => a.appointment_status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilterTab('completed')}
              className={`tab-btn ${filterTab === 'completed' ? 'active' : ''}`}
            >
              Completed ({appointments.filter(a => a.appointment_status === 'completed').length})
            </button>
          </div>

          {loading ? (
            <LoadingSpinner message="Retrieving appointment records..." />
          ) : filteredAppointments.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
              {filteredAppointments.map(appt => (
                <div key={appt.id} className="appointment-card">
                  <div>
                    <div className="appointment-header">
                      <div>
                        <span className="appointment-ref">{appt.appointment_reference}</span>
                        <h3 style={{ fontSize: '1.2rem', marginTop: '6px' }}>{appt.patient_name}</h3>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {appt.patient_phone || appt.patient_email}
                        </div>
                      </div>
                      <div>
                        <span className={`badge ${
                          appt.appointment_status === 'completed' ? 'badge-teal' :
                          appt.appointment_status === 'confirmed' ? 'badge-success' : 'badge-danger'
                        }`}>
                          {appt.appointment_status}
                        </span>
                      </div>
                    </div>

                    <div className="appointment-body">
                      <div className="appointment-time-box">
                        <Calendar size={15} color="#0d9488" />
                        <span>{new Date(appt.appointment_datetime).toLocaleDateString()}</span>
                        <Clock size={15} color="#0284c7" style={{ marginLeft: '6px' }} />
                        <span>{new Date(appt.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      {appt.patient_notes && (
                        <div style={{
                          padding: '8px 12px',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '0.85rem',
                          color: '#334155'
                        }}>
                          <strong>Patient Notes:</strong> {appt.patient_notes}
                        </div>
                      )}

                      {/* Clinical records status tags */}
                      <div className="appointment-tags">
                        {appt.records_uploaded ? (
                          appt.consent_granted ? (
                            <span className="badge badge-success">
                              <Shield size={12} /> AI Summary & Records Authorized
                            </span>
                          ) : (
                            <span className="badge badge-warning">
                              Records Attached (Awaiting Patient Consent)
                            </span>
                          )
                        ) : (
                          <span className="badge badge-info">
                            No Records Attached
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="appointment-footer">
                    <Link to={`/appointments/${appt.id}`} className="btn btn-primary btn-sm">
                      Open Clinical View
                    </Link>

                    {appt.appointment_status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(appt.id, 'completed')}
                        className="btn btn-secondary btn-sm"
                        title="Mark consultation completed"
                      >
                        <CheckCircle2 size={14} color="#10b981" /> Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Calendar size={32} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h3>No Appointments in this View</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
                No appointments match the selected filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
