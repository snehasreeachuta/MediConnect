import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, Clock, MapPin, FileUp, ArrowRight, ShieldCheck } from 'lucide-react';
import appointmentService from '../services/appointmentService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [loading, setLoading] = useState(!location.state?.appointment);

  useEffect(() => {
    if (!appointment && id) {
      appointmentService.getAppointmentById(id)
        .then(appt => setAppointment(appt))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, appointment]);

  if (loading) return <LoadingSpinner message="Retrieving appointment confirmation..." fullScreen />;

  return (
    <div style={{ padding: '60px 0 80px', background: 'radial-gradient(circle at 10% 20%, rgb(240, 253, 250) 0%, rgb(248, 250, 252) 90%)', minHeight: 'calc(100vh - 140px)' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '48px 36px', boxShadow: 'var(--shadow-lg)' }}>
          {/* Success Check */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ccfbf1, #e0f2fe)',
            color: '#0d9488',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)'
          }}>
            <CheckCircle2 size={46} />
          </div>

          <h1 style={{ fontSize: '2.1rem', color: '#0f172a', marginBottom: '8px' }}>
            Appointment Confirmed!
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '24px' }}>
            Your consultation request has been secured in the hospital schedule.
          </p>

          {/* Reference Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f1f5f9',
            padding: '8px 18px',
            borderRadius: '9999px',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: '#0284c7',
            marginBottom: '28px'
          }}>
            Booking Reference: {appointment?.appointment_reference || `MC-${id}`}
          </div>

          {/* Appointment Snapshot Box */}
          {appointment && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px 24px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '32px',
              fontSize: '0.95rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ color: '#64748b' }}>Doctor:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{appointment.doctor_name || 'Medical Specialist'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <span style={{ color: '#64748b' }}>Scheduled For:</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>
                  {appointment.appointment_datetime ? new Date(appointment.appointment_datetime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Scheduled Time'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Consultation Fee:</span>
                <span style={{ fontWeight: 800, color: '#0d9488' }}>
                  ${Number(appointment.consultation_fee || 0).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Prompt: Upload Medical Records */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdfa, #ffffff)',
            border: '2px solid rgba(13, 148, 136, 0.35)',
            borderRadius: '16px',
            padding: '28px 24px',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '8px' }}>
              Would you like to upload your previous medical records for your doctor to review?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '22px' }}>
              Upload lab panels, discharge summaries, or prescriptions (PDF format). MediConnect AI will generate a structured 9-section clinical history summary with your explicit authorization.
            </p>

            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/patient/records?appointmentId=${id}`)}
                className="btn btn-primary"
                style={{ padding: '12px 24px' }}
              >
                <FileUp size={18} /> Upload Medical Records
              </button>

              <button
                onClick={() => navigate('/patient/dashboard')}
                className="btn btn-secondary"
                style={{ padding: '12px 24px' }}
              >
                Skip for Now
              </button>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#10b981" />
            Uploading records is completely optional. You can review and share records anytime from your dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}
