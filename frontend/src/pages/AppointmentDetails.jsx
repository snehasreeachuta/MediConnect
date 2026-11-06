import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Shield, ShieldAlert, Sparkles, Download, FileText, CheckCircle2, User, Printer, Save } from 'lucide-react';
import appointmentService from '../services/appointmentService';
import medicalRecordService from '../services/medicalRecordService';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

export default function AppointmentDetails() {
  const { id } = useParams();
  const user = authService.getCurrentUser();
  const isDoctor = user?.role === 'doctor';
  const isPatient = user?.role === 'patient';

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchAppointmentDetails = async () => {
    try {
      const data = await appointmentService.getAppointmentById(id);
      setAppointment(data);
      if (data.doctor_notes) {
        setDoctorNotes(data.doctor_notes);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const handleGrantConsent = async () => {
    try {
      await medicalRecordService.shareConsent(id);
      setMessage('Consent granted. Your doctor now has permission to review your AI summary and records.');
      fetchAppointmentDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to grant consent.');
    }
  };

  const handleRevokeConsent = async () => {
    if (!window.confirm('Are you sure you want to revoke doctor access to your records for this appointment?')) return;
    try {
      await medicalRecordService.revokeConsent(id);
      setMessage('Access revoked. Doctor will no longer be able to view these records.');
      fetchAppointmentDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke access.');
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await appointmentService.saveDoctorNotes(id, doctorNotes);
      setMessage('Doctor clinical notes saved securely.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handlePrintSummary = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner message="Loading appointment details..." fullScreen />;
  if (!appointment) return <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>Appointment not found.</div>;

  const summary = appointment.summary;
  const structured = summary ? (typeof summary.structured_json === 'string' ? JSON.parse(summary.structured_json) : summary.structured_json) : null;

  return (
    <div style={{ padding: '36px 0 60px' }}>
      <div className="container" style={{ maxWidth: '950px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '24px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="appointment-ref">{appointment.appointment_reference}</span>
              <span className={`badge ${appointment.appointment_status === 'completed' ? 'badge-teal' : 'badge-success'}`}>
                {appointment.appointment_status}
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', marginTop: '6px' }}>
              Consultation with {isDoctor ? appointment.patient_name : appointment.doctor_name}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {summary && (
              <button onClick={handlePrintSummary} className="btn btn-secondary btn-sm">
                <Printer size={15} /> Print Summary
              </button>
            )}
            <Link to={isDoctor ? '/doctor/dashboard' : '/patient/dashboard'} className="btn btn-secondary btn-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>

        <Notification type="success" message={message} onClose={() => setMessage(null)} />
        <Notification type="error" message={error} onClose={() => setError(null)} />

        {/* Appointment Information Card */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', fontSize: '0.92rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Date & Time
              </span>
              <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} color="#0d9488" />
                {new Date(appointment.appointment_datetime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div style={{ color: '#475569', fontSize: '0.85rem', marginTop: '2px' }}>
                {new Date(appointment.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                {isDoctor ? 'Patient Contact' : 'Consulting Doctor'}
              </span>
              <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                {isDoctor ? appointment.patient_name : appointment.doctor_name}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {isDoctor ? (appointment.patient_phone || appointment.patient_email) : appointment.specialization}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Clinic Location
              </span>
              <div style={{ fontWeight: 600, color: '#0f172a', marginTop: '4px' }}>
                {appointment.hospital_name}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                {appointment.hospital_address}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                Consultation Fee
              </span>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0d9488', marginTop: '4px' }}>
                ${Number(appointment.consultation_fee).toFixed(2)}
              </div>
              <span className="badge badge-info" style={{ marginTop: '2px' }}>
                Payment: {appointment.payment_status}
              </span>
            </div>
          </div>

          {appointment.patient_notes && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', fontSize: '0.92rem' }}>
              <strong>Patient Chief Complaint / Notes:</strong>
              <p style={{ color: '#475569', marginTop: '4px' }}>{appointment.patient_notes}</p>
            </div>
          )}
        </div>

        {/* Patient Sharing & Consent Controls */}
        {isPatient && (
          <div className="consent-panel">
            <div className="consent-header">
              <Shield size={22} color={appointment.hasConsent ? '#10b981' : '#f59e0b'} />
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Medical Record Privacy & Consent</h3>
                <p style={{ fontSize: '0.88rem', color: '#475569' }}>
                  Control whether Dr. {appointment.doctor_name} has permission to inspect your AI medical history summary and attached documents for this appointment.
                </p>
              </div>
            </div>

            <div className="consent-actions">
              {appointment.hasConsent ? (
                <>
                  <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                    <CheckCircle2 size={14} /> Shared with Doctor
                  </span>
                  <button onClick={handleRevokeConsent} className="btn btn-danger btn-sm">
                    Revoke Doctor Access
                  </button>
                </>
              ) : (
                <button onClick={handleGrantConsent} className="btn btn-primary btn-sm">
                  <Shield size={14} /> Authorize Doctor Access
                </button>
              )}

              <Link to={`/patient/records?appointmentId=${id}`} className="btn btn-outline btn-sm">
                <FileText size={14} /> Manage Records for this Visit
              </Link>
            </div>
          </div>
        )}

        {/* AI Medical History Summary Section */}
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Sparkles size={22} color="#0d9488" />
            <h2 style={{ fontSize: '1.4rem', color: '#0f172a' }}>AI Medical History Summary</h2>
          </div>

          {/* Access Check */}
          {isDoctor && !appointment.hasConsent ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 24px', background: '#f8fafc' }}>
              <ShieldAlert size={36} color="#f59e0b" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>Patient Records Protected</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                No medical records have been shared for this appointment. The patient has not granted consent to share their uploaded records.
              </p>
            </div>
          ) : structured ? (
            <div className="summary-container" style={{ marginTop: 0 }}>
              <div className="summary-header">
                <div>
                  <span className="badge badge-teal" style={{ marginBottom: '6px' }}>
                    Clinical Review Mode
                  </span>
                  <h3 style={{ fontSize: '1.25rem' }}>Structured Patient History</h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    Generated on {new Date(summary.generated_at).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="summary-disclaimer-banner">
                <strong>AI-Generated Summary: For Review by a Qualified Healthcare Professional.</strong> This summary is intended to assist medical history review and does not diagnose conditions, prescribe treatment, or replace clinical judgment.
              </div>

              <div className="summary-section-grid">
                <div className="summary-section-box">
                  <div className="summary-section-title">1. Patient Information</div>
                  <div className="summary-section-content">{structured.patient_information}</div>
                </div>

                <div className="summary-section-box">
                  <div className="summary-section-title">2. Document Dates and Types</div>
                  <div className="summary-section-content">{structured.document_dates_and_types}</div>
                </div>

                <div className="summary-section-box">
                  <div className="summary-section-title">3. Previously Documented Medical Conditions</div>
                  <div className="summary-section-content">{structured.previously_documented_conditions}</div>
                </div>

                <div className="summary-section-box">
                  <div className="summary-section-title">4. Previous Treatments and Medications</div>
                  <div className="summary-section-content">{structured.previous_treatments_and_medications}</div>
                </div>

                <div className="summary-section-box">
                  <div className="summary-section-title">5. Allergies Documented in the Records</div>
                  <div className="summary-section-content">{structured.allergies_documented}</div>
                </div>

                <div className="summary-section-box">
                  <div className="summary-section-title">6. Important Laboratory Results</div>
                  <div className="summary-section-content">{structured.important_laboratory_results}</div>
                </div>

                <div className="summary-section-box">
                  <div className="summary-section-title">7. Other Relevant Medical Findings</div>
                  <div className="summary-section-content">{structured.other_relevant_medical_findings}</div>
                </div>

                <div className="summary-section-box highlight">
                  <div className="summary-section-title alert">8. Information Requiring Doctor Review</div>
                  <div className="summary-section-content">{structured.information_requiring_doctor_review}</div>
                </div>

                <div className="summary-section-box">
                  <div className="summary-section-title">9. Missing or Unclear Information</div>
                  <div className="summary-section-content">{structured.missing_or_unclear_information}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '36px', background: '#f8fafc' }}>
              <p style={{ color: '#64748b' }}>
                No medical records have been shared for this appointment.
              </p>
              {isPatient && (
                <div style={{ marginTop: '14px' }}>
                  <Link to={`/patient/records?appointmentId=${id}`} className="btn btn-outline btn-sm">
                    Upload Records
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Attached Original Documents (if access granted) */}
        {appointment.medicalRecords && appointment.medicalRecords.length > 0 && (appointment.hasConsent || isPatient) && (
          <div style={{ marginTop: '36px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#0284c7" /> Original Medical Documents ({appointment.medicalRecords.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {appointment.medicalRecords.map(doc => (
                <div key={doc.id} style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{doc.originalFilename}</span>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {(doc.fileSize / 1024).toFixed(0)} KB • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => medicalRecordService.downloadRecord(doc.id, doc.originalFilename)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Doctor Consultation Notes (Private) */}
        {isDoctor && (
          <div className="card" style={{ marginTop: '36px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#0d9488" /> Private Doctor Clinical Notes
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '14px' }}>
              These clinical notes are private to you as the attending physician and are not visible to the patient.
            </p>

            <textarea
              className="form-control"
              rows="4"
              placeholder="Record clinical observations, treatment recommendations, prescription modifications..."
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
            ></textarea>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button onClick={handleSaveNotes} disabled={savingNotes} className="btn btn-primary btn-sm">
                <Save size={14} /> {savingNotes ? 'Saving Notes...' : 'Save Private Notes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
