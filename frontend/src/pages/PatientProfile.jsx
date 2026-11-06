import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, HeartPulse, Save, Shield } from 'lucide-react';
import authService from '../services/authService';
import api from '../services/api';
import Notification from '../components/Notification';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PatientProfile() {
  const user = authService.getCurrentUser();
  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    bloodGroup: '',
    address: '',
    emergencyContact: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.profile) {
      setProfile(prev => ({
        ...prev,
        dateOfBirth: user.profile.date_of_birth || '',
        gender: user.profile.gender || 'prefer_not_to_say',
        bloodGroup: user.profile.blood_group || '',
        address: user.profile.address || '',
        emergencyContact: user.profile.emergency_contact || ''
      }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      // Refresh current user
      await authService.getMe();
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '36px 0 60px' }}>
      <div className="container" style={{ maxWidth: '750px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '8px' }}>
            Patient Profile
          </h1>
          <p style={{ color: '#64748b' }}>
            Manage your personal healthcare demographics and contact details.
          </p>
        </div>

        <Notification type="success" message={message} onClose={() => setMessage(null)} />
        <Notification type="error" message={error} onClose={() => setError(null)} />

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.fullName}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={profile.email}
                  disabled
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-control"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Biological Gender</label>
                <select
                  className="form-control"
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                >
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. O+, A+, B-"
                  value={profile.bloodGroup}
                  onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Residential Address</label>
              <input
                type="text"
                className="form-control"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact Name & Phone</label>
              <input
                type="text"
                className="form-control"
                placeholder="Jane Doe (+1 555-0198)"
                value={profile.emergencyContact}
                onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
              />
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '12px' }}>
              <Save size={16} /> Save Profile Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
