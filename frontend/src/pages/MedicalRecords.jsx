import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FileUp, FileText, CheckCircle2, AlertCircle, Sparkles, Shield, Trash2, ArrowLeft, Calendar, FileImage, AlertTriangle } from 'lucide-react';
import medicalRecordService from '../services/medicalRecordService';
import appointmentService from '../services/appointmentService';
import MedicalRecordCard from '../components/MedicalRecordCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

export default function MedicalRecords() {
  const [searchParams] = useSearchParams();
  const urlAppointmentId = searchParams.get('appointmentId');
  const fileInputRef = useRef(null);

  const [records, setRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(urlAppointmentId || '');
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [activeSummary, setActiveSummary] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchRecords = async () => {
    try {
      const list = await medicalRecordService.getMyRecords();
      setRecords(list);
    } catch (err) {
      console.error('Error loading records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const list = await appointmentService.getMyAppointments();
      setAppointments(list);
    } catch (err) {
      console.warn('Could not fetch appointments for record linkage:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchAppointments();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const isAllowed = allowedMimeTypes.includes(file.type) ||
      /\.(pdf|jpe?g|png|webp)$/i.test(file.name);

    if (!isAllowed) {
      return setError('Invalid format: Only PDF documents and medical images (JPEG, PNG, WEBP) are supported.');
    }

    if (file.size > 10 * 1024 * 1024) {
      return setError('File is too large. Maximum allowed size is 10 MB.');
    }

    setError(null);
    setMessage(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    const targetApptId = selectedAppointmentId || urlAppointmentId;
    if (targetApptId) {
      formData.append('appointmentId', targetApptId);
      const apptObj = appointments.find(a => String(a.id) === String(targetApptId));
      if (apptObj && apptObj.doctor_id) {
        formData.append('doctorId', apptObj.doctor_id);
      }
    }

    try {
      const res = await medicalRecordService.uploadRecord(formData, (percent) => {
        setUploadProgress(percent);
      });

      setMessage('Medical document uploaded successfully and AI summarization completed!');
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical record? This action cannot be undone.')) return;
    try {
      await medicalRecordService.deleteRecord(id);
      setMessage('Medical record deleted successfully.');
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  const handleSummarize = async (id) => {
    setError(null);
    try {
      const res = await medicalRecordService.summarizeRecord(id);
      setActiveSummary(res.structured);
      setMessage('AI Summary generated successfully.');
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Summarization failed.');
    }
  };

  return (
    <div className="medical-records-page">
      <div className="container" style={{ maxWidth: '950px' }}>
        {/* Navigation Breadcrumb */}
        {urlAppointmentId && (
          <div style={{ marginBottom: '16px' }}>
            <Link to={`/booking-confirmation/${urlAppointmentId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b' }}>
              <ArrowLeft size={16} /> Back to Appointment Confirmation
            </Link>
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '8px' }}>
            Medical Records & AI Summarization
          </h1>
          <p style={{ color: '#64748b' }}>
            Upload previous medical records (PDF or diagnostic images). Our AI clinical engine extracts relevant details and compiles a concise 9-part clinical summary for your consulting doctor.
          </p>
        </div>

        <Notification type="success" message={message} onClose={() => setMessage(null)} />
        <Notification type="error" message={error} onClose={() => setError(null)} />

        {/* Optional Appointment Linkage Dropdown */}
        {appointments.length > 0 && (
          <div style={{
            background: '#ffffff',
            padding: '16px 20px',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} color="#0d9488" />
              <div>
                <strong style={{ fontSize: '0.9rem', color: '#1e293b' }}>Link to Upcoming Consultation:</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                  Choose which appointment doctor should receive this report and AI summary
                </p>
              </div>
            </div>
            <select
              value={selectedAppointmentId}
              onChange={(e) => setSelectedAppointmentId(e.target.value)}
              className="form-control"
              style={{ maxWidth: '320px', fontSize: '0.86rem' }}
            >
              <option value="">General Record (No specific appointment)</option>
              {appointments.map((appt) => (
                <option key={appt.id} value={appt.id}>
                  {appt.doctor_name || 'Dr. Consultation'} - {appt.appointment_date} ({appt.appointment_time})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Drag & Drop Upload Zone */}
        <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="application/pdf,image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
          />
          <div className="upload-icon-circle">
            <FileUp size={30} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: '#0f172a' }}>
            Click or drag medical reports or diagnostic images to upload
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto' }}>
            Supported formats: PDF, JPEG, PNG, WEBP (Lab results, prescriptions, X-rays, discharge summaries - Max 10 MB).
          </p>

          {uploadProgress !== null && (
            <div style={{ maxWidth: '400px', margin: '20px auto 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#0d9488', fontWeight: 600 }}>
                <span>Uploading & Extracting...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="upload-progress-bar">
                <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Documents List */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
            Your Stored Medical Documents ({records.length})
          </h3>

          {loading ? (
            <LoadingSpinner message="Loading your documents..." />
          ) : records.length > 0 ? (
            records.map(record => (
              <MedicalRecordCard
                key={record.id}
                record={record}
                onDelete={handleDelete}
                onSummarize={handleSummarize}
              />
            ))
          ) : (
            <div className="empty-state">
              <FileText size={32} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h4>No medical documents uploaded yet</h4>
              <p style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '6px' }}>
                Upload previous health records above so your doctor can review your medical history.
              </p>
            </div>
          )}
        </div>

        {/* Active Structured Summary Preview if present */}
        {activeSummary && (
          <div className="summary-container">
            <div className="summary-header">
              <div>
                <span className="badge badge-teal" style={{ marginBottom: '8px' }}>
                  <Sparkles size={12} /> AI Clinical Summary
                </span>
                <h2>Structured Clinical History</h2>
              </div>
              <button onClick={() => setActiveSummary(null)} className="btn btn-secondary btn-sm">
                Close Preview
              </button>
            </div>

            {/* Identity Mismatch Warning Banner */}
            {activeSummary.identity_mismatch_detected && (
              <div style={{
                background: '#fffbeb',
                border: '2px solid #f59e0b',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px'
              }}>
                <AlertTriangle size={26} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ color: '#92400e', margin: '0 0 6px', fontSize: '1rem', fontWeight: 700 }}>
                    ⚠️ Patient Identity Mismatch Detected
                  </h4>
                  <p style={{ margin: 0, color: '#78350f', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {activeSummary.identity_warning || `The uploaded medical report explicitly identifies the patient as "${activeSummary.reported_patient_name}", which differs from your active account name ("${activeSummary.account_holder_name}"). Please verify patient identity prior to consultation.`}
                  </p>
                </div>
              </div>
            )}

            <div className="summary-disclaimer-banner">
              <strong>Clinical Review Notice:</strong> AI-Generated Summary: For Review by a Qualified Healthcare Professional. This summary is intended to assist medical history review and does not diagnose conditions, prescribe treatment, or replace clinical judgment.
            </div>

            <div className="summary-section-grid">
              <div className="summary-section-box">
                <div className="summary-section-title">1. Patient Information</div>
                <div className="summary-section-content">{activeSummary.patient_information}</div>
              </div>

              <div className="summary-section-box">
                <div className="summary-section-title">2. Document Type and Date</div>
                <div className="summary-section-content">{activeSummary.document_type_and_date || activeSummary.document_dates_and_types}</div>
              </div>

              <div className="summary-section-box">
                <div className="summary-section-title">3. Normal Findings</div>
                <div className="summary-section-content">{activeSummary.normal_findings || activeSummary.other_relevant_medical_findings}</div>
              </div>

              <div className="summary-section-box highlight">
                <div className="summary-section-title alert">4. Abnormal Findings</div>
                <div className="summary-section-content">{activeSummary.abnormal_findings || activeSummary.previously_documented_conditions}</div>
              </div>

              <div className="summary-section-box">
                <div className="summary-section-title">5. Measurements and Laboratory Values</div>
                <div className="summary-section-content">{activeSummary.measurements_and_laboratory_values || activeSummary.important_laboratory_results}</div>
              </div>

              {activeSummary.radiologist_doctor_impression && (
                <div className="summary-section-box highlight">
                  <div className="summary-section-title alert">6. Radiologist / Doctor Impression</div>
                  <div className="summary-section-content">{activeSummary.radiologist_doctor_impression}</div>
                </div>
              )}

              {activeSummary.recommendations_mentioned && (
                <div className="summary-section-box">
                  <div className="summary-section-title">7. Recommendations Mentioned in Report</div>
                  <div className="summary-section-content">{activeSummary.recommendations_mentioned}</div>
                </div>
              )}

              <div className="summary-section-box">
                <div className="summary-section-title">8. Information Requiring Doctor Review</div>
                <div className="summary-section-content">{activeSummary.information_requiring_doctor_review}</div>
              </div>

              <div className="summary-section-box">
                <div className="summary-section-title">9. Missing or Unclear Information</div>
                <div className="summary-section-content">{activeSummary.missing_or_unclear_information}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
