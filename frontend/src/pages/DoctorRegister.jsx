import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Building, Award, Clock, CheckCircle2 } from 'lucide-react';
import authService from '../services/authService';
import Notification from '../components/Notification';

export default function DoctorRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specialization: 'Cardiology',
    qualifications: '',
    experienceYears: 5,
    medicalLicenseNumber: '',
    biography: '',
    consultationFee: 120,
    hospitalName: '',
    hospitalAddress: '',
    city: '',
    state: '',
    postalCode: '',
    hospitalPhone: '',
    appointmentDuration: 30
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await authService.registerDoctor(formData);
      setSuccess(true);
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to MediConnect server. Please ensure the backend is running on port 5001.');
      } else {
        setError(err.response?.data?.message || 'Doctor application failed. Please check required fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container" style={{ maxWidth: '580px' }}>
          <div className="auth-card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h2 style={{ fontSize: '1.8rem', color: '#0f172a', marginBottom: '12px' }}>
              Application Submitted
            </h2>

            <div className="alert alert-info" style={{ textAlign: 'left', margin: '20px 0' }}>
              <div>
                <strong>Pending Administrator Verification</strong>
                <p style={{ marginTop: '4px', fontSize: '0.88rem' }}>
                  Your medical credentials and hospital affiliation are currently awaiting review by our compliance team. Once verified, your profile and available consultation slots will automatically appear in public search.
                </p>
              </div>
            </div>

            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '28px' }}>
              You may now log in to review your profile and update your default working availability.
            </p>

            <Link to="/doctor/dashboard" className="btn btn-primary" style={{ width: '100%' }}>
              Proceed to Doctor Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '820px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <span className="role-badge" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              Healthcare Provider Enrollment
            </span>
            <h1>Join MediConnect Provider Network</h1>
            <p>Register your clinic credentials and start receiving verified appointment bookings</p>
          </div>

          <Notification type="error" message={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit}>
            {/* 1. Personal Information */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={18} color="#0d9488" /> 1. Personal & Login Details
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name with Title *</label>
                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    placeholder="e.g. Dr. Arthur Hayes, MD"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Professional Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="dr.hayes@hospital.org"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    placeholder="Re-type password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* 2. Professional Credentials */}
            <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="#0284c7" /> 2. Professional Qualifications
              </h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Medical Specialization *</label>
                  <select
                    name="specialization"
                    className="form-control"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="General Medicine">General Medicine</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Psychiatry">Psychiatry</option>
                    <option value="Endocrinology">Endocrinology</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Qualifications & Degrees *</label>
                  <input
                    type="text"
                    name="qualifications"
                    className="form-control"
                    placeholder="e.g. MD, FACC, Johns Hopkins"
                    value={formData.qualifications}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Medical License Number *</label>
                  <input
                    type="text"
                    name="medicalLicenseNumber"
                    className="form-control"
                    placeholder="e.g. MED-LIC-WA-12345"
                    value={formData.medicalLicenseNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Experience *</label>
                  <input
                    type="number"
                    name="experienceYears"
                    className="form-control"
                    min="0"
                    max="60"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Consultation Fee ($ USD) *</label>
                  <input
                    type="number"
                    name="consultationFee"
                    className="form-control"
                    min="0"
                    step="5"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Professional Biography</label>
                <textarea
                  name="biography"
                  className="form-control"
                  rows="3"
                  placeholder="Summary of clinical interests, fellowship backgrounds, and specialties..."
                  value={formData.biography}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* 3. Hospital or Clinic Details */}
            <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} color="#2563eb" /> 3. Hospital or Clinic Affiliation
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hospital or Clinic Name *</label>
                  <input
                    type="text"
                    name="hospitalName"
                    className="form-control"
                    placeholder="e.g. Pacific Coast Medical Pavilion"
                    value={formData.hospitalName}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Clinic Contact Number</label>
                  <input
                    type="tel"
                    name="hospitalPhone"
                    className="form-control"
                    placeholder="+1 (555) 321-7654"
                    value={formData.hospitalPhone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Street Address *</label>
                <input
                  type="text"
                  name="hospitalAddress"
                  className="form-control"
                  placeholder="e.g. 1500 Healthcare Blvd, Suite 300"
                  value={formData.hospitalAddress}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="Seattle"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State / Province *</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    placeholder="Washington"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    className="form-control"
                    placeholder="98101"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '0.85rem',
              color: '#475569',
              marginBottom: '20px'
            }}>
              <strong>Default Schedule Notice:</strong> Your account will be initialized with standard Monday through Friday availability (09:00 - 17:00, 30-minute consultation slots). You can customize specific hours from your provider dashboard at any time.
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Submitting Credentials...' : 'Submit Provider Application'}
            </button>
          </form>

          <div className="auth-footer">
            Already registered? <Link to="/doctor/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
