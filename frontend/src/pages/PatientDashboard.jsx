import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, FileText, User, Clock, CheckCircle2, AlertCircle, PlusCircle, ArrowRight } from 'lucide-react';
import authService from '../services/authService';
import appointmentService from '../services/appointmentService';
import medicalRecordService from '../services/medicalRecordService';
import AppointmentCard from '../components/AppointmentCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PatientDashboard() {
  const user = authService.getCurrentUser();
  const [appointments, setAppointments] = useState([]);
  const [recordsCount, setRecordsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [appts, recs] = await Promise.all([
        appointmentService.getMyAppointments(),
        medicalRecordService.getMyRecords()
      ]);
      setAppointments(appts || []);
      setRecordsCount((recs || []).length);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(id, 'Patient requested cancellation');
      loadDashboardData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment.');
    }
  };

  // Filter appointments
  const now = new Date().getTime();
  const upcomingAppointments = appointments.filter(a => {
    const isCancelled = a.appointment_status === 'cancelled';
    const isCompleted = a.appointment_status === 'completed';
    const isFuture = new Date(a.appointment_datetime).getTime() >= now;
    return !isCancelled && !isCompleted && isFuture;
  });

  const pastAppointments = appointments.filter(a => {
    const isCancelled = a.appointment_status === 'cancelled';
    const isCompleted = a.appointment_status === 'completed';
    const isPast = new Date(a.appointment_datetime).getTime() < now;
    return isCancelled || isCompleted || isPast;
  });

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Welcome Banner */}
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Welcome back, {user?.fullName || 'Patient'}!</h1>
            <p>Here is your healthcare appointment and medical records overview.</p>
          </div>
          <div>
            <Link to="/doctors" className="btn btn-primary">
              <Search size={16} /> Find a Doctor
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
              <div className="stat-value">{upcomingAppointments.length}</div>
              <div className="stat-label">Upcoming Consultations</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <FileText size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">{recordsCount}</div>
              <div className="stat-label">Uploaded Records (PDF)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <CheckCircle2 size={26} />
            </div>
            <div className="stat-info">
              <div className="stat-value">
                {appointments.filter(a => a.appointment_status === 'completed').length}
              </div>
              <div className="stat-label">Completed Consultations</div>
            </div>
          </div>
        </div>

        {/* Appointment Tabs */}
        <div className="dashboard-section">
          <div className="tab-nav">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            >
              Upcoming Consultations ({upcomingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            >
              Past & Completed ({pastAppointments.length})
            </button>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading your appointments..." />
          ) : (
            <div>
              {activeTab === 'upcoming' && (
                upcomingAppointments.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {upcomingAppointments.map(appt => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        isDoctor={false}
                        onCancel={handleCancelAppointment}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Calendar size={28} />
                    </div>
                    <h3>No Upcoming Appointments</h3>
                    <p style={{ marginTop: '8px', marginBottom: '20px' }}>
                      You have no upcoming consultations scheduled. Need medical care?
                    </p>
                    <Link to="/doctors" className="btn btn-primary btn-sm">
                      <Search size={14} /> Schedule with a Specialist
                    </Link>
                  </div>
                )
              )}

              {activeTab === 'past' && (
                pastAppointments.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {pastAppointments.map(appt => (
                      <AppointmentCard
                        key={appt.id}
                        appointment={appt}
                        isDoctor={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No past consultations on record yet.</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Quick Action Banner */}
        <div className="card" style={{
          background: 'linear-gradient(135deg, #f0fdfa, #f8fafc)',
          borderColor: '#ccfbf1',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '40px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Manage Your Health Records Vault</h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
              Upload and manage your medical documents (PDF) and generate structured AI clinical summaries.
            </p>
          </div>
          <Link to="/patient/records" className="btn btn-primary">
            <FileText size={16} /> Open Health Records <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
