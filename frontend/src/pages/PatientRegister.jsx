import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Calendar, HeartPulse } from 'lucide-react';
import authService from '../services/authService';
import Notification from '../components/Notification';

export default function PatientRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    bloodGroup: '',
    address: '',
    emergencyContact: ''
  });

  const [error, setError] = useState(null);
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
      await authService.registerPatient(formData);
      navigate('/patient/dashboard');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to MediConnect server. Please ensure the backend is running on port 5001.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please check your information.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '640px' }}>
        <div className="auth-card">
          <div className="auth-header">
            <span className="role-badge">New Patient</span>
            <h1>Create Patient Account</h1>
            <p>Register to book doctors and organize your medical history</p>
          </div>

          <Notification type="error" message={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-control"
                  placeholder="e.g. Emily Rose"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="name@example.com"
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-control"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-control"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group (Optional)</label>
                <input
                  type="text"
                  name="bloodGroup"
                  className="form-control"
                  placeholder="e.g. O+, A+, B-"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Street address, city, state"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Patient Registration'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account? <Link to="/patient/login">Sign in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
