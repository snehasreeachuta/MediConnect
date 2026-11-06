import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FileUp, FileText, CheckCircle2, AlertCircle, Sparkles, Shield, Trash2, ArrowLeft } from 'lucide-react';
import medicalRecordService from '../services/medicalRecordService';
import MedicalRecordCard from '../components/MedicalRecordCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

export default function MedicalRecords() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const fileInputRef = useRef(null);

  const [records, setRecords] = useState([]);
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

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      return setError('Invalid format: Only PDF documents are supported for medical record upload.');
    }

    if (file.size > 10 * 1024 * 1024) {
      return setError('File is too large. Maximum allowed size is 10 MB.');
    }

    setError(null);
    setMessage(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    if (appointmentId) {
      formData.append('appointmentId', appointmentId);
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
        {appointmentId && (
          <div style={{ marginBottom: '16px' }}>
            <Link to={`/booking-confirmation/${appointmentId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b' }}>
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
            Upload your previous medical records (PDF). Our AI service extracts relevant text and organizes it into a concise clinical summary for your consulting doctor.
          </p>
        </div>

        <Notification type="success" message={message} onClose={() => setMessage(null)} />
        <Notification type="error" message={error} onClose={() => setError(null)} />

        {/* Drag & Drop Upload Zone */}
        <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="application/pdf"
            style={{ display: 'none' }}
          />
          <div className="upload-icon-circle">
            <FileUp size={30} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: '#0f172a' }}>
            Click or drag medical PDF documents to upload
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto' }}>
            Supported: Blood tests, CBC panels, prescriptions, discharge summaries (Max 10 MB).
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

            <div className="summary-disclaimer-banner">
              <strong>Clinical Review Notice:</strong> AI-Generated Summary: For Review by a Qualified Healthcare Professional. This summary is intended to assist medical history review and does not diagnose conditions, prescribe treatment, or replace clinical judgment.
            </div>

            <div className="summary-section-grid">
              <div className="summary-section-box">
                <div className="summary-section-title">1. Patient Information</div>
                <div className="summary-section-content">{activeSummary.patient_information}</div>
              </div>

              <div className="summary-section-box">
                <div className="summary-section-title">2. Document Dates & Types</div>
                <div className="summary-section-content">{activeSummary.document_dates_and_types}</div>
              </div>

              <div className="summary-section-box">
                <div className="summary-section-title">3. Previously Documented Medical Conditions</div>
                <div className="summary-section-content">{activeSummary.previously_documented_conditions}</div>
              </div>

              <div className="summary-section-box">
                <div className="summary-section-title">4. Previous Treatments and Medications</div>
                <div className="summary-section-content">{activeSummary.previous_treatments_and_medications}</div>
              </div>

              <div className="summary-section-box">
                <div className="summary-section-title">5. Allergies Documented in the Records</div>
                <div className="summary-section-content">{activeSummary.allergies_documented}</div>
              </div>

              <div className="summary-section-box">
                <div className="summary-section-title">6. Important Laboratory Results</div>
                <div className="summary-section-content">{activeSummary.important_laboratory_results}</div>
              </div>

              <div className="summary-section-box">
                <div className="summary-section-title">7. Other Relevant Medical Findings</div>
                <div className="summary-section-content">{activeSummary.other_relevant_medical_findings}</div>
              </div>

              <div className="summary-section-box highlight">
                <div className="summary-section-title alert">8. Information Requiring Doctor Review</div>
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
