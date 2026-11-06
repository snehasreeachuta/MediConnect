import React, { useState, useEffect } from 'react';
import { Save, Clock, Building, Stethoscope, CheckCircle2 } from 'lucide-react';
import doctorService from '../services/doctorService';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

export default function DoctorProfile() {
  const user = authService.getCurrentUser();
  const [profile, setProfile] = useState({
    biography: '',
    consultationFee: 120,
    hospitalName: '',
    hospitalAddress: '',
    city: '',
    state: '',
    postalCode: '',
    hospitalPhone: ''
  });

  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.profile?.id) {
      doctorService.getDoctorById(user.profile.id)
        .then(res => {
          const doc = res.doctor;
          setProfile({
            biography: doc.biography || '',
            consultationFee: doc.consultation_fee || 100,
            hospitalName: doc.hospital_name || '',
            hospitalAddress: doc.hospital_address || '',
            city: doc.city || '',
            state: doc.state || '',
            postalCode: doc.postal_code || '',
            hospitalPhone: doc.hospital_phone || ''
          });
          setAvailability(doc.availability || []);
        })
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await doctorService.updateProfile(profile);
      setMessage('Professional profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityToggle = (dayNum) => {
    const exists = availability.find(a => a.day_of_week === dayNum);
    if (exists) {
      setAvailability(availability.filter(a => a.day_of_week !== dayNum));
    } else {
      setAvailability([...availability, {
        day_of_week: dayNum,
        start_time: '09:00:00',
        end_time: '17:00:00',
        slot_duration_minutes: 30,
        break_start_time: '13:00:00',
        break_end_time: '14:00:00'
      }]);
    }
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      await doctorService.updateAvailability(availability);
      setMessage('Schedule availability updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading doctor settings..." fullScreen />;

  const days = [
    { num: 1, name: 'Monday' },
    { num: 2, name: 'Tuesday' },
    { num: 3, name: 'Wednesday' },
    { num: 4, name: 'Thursday' },
    { num: 5, name: 'Friday' },
    { num: 6, name: 'Saturday' },
    { num: 0, name: 'Sunday' }
  ];

  return (
    <div style={{ padding: '36px 0 60px' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '8px' }}>
            Doctor Profile & Availability
          </h1>
          <p style={{ color: '#64748b' }}>
            Configure your clinical practice information and manage your consultation schedule.
          </p>
        </div>

        <Notification type="success" message={message} onClose={() => setMessage(null)} />
        <Notification type="error" message={error} onClose={() => setError(null)} />

        {/* Profile Details Form */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="#0284c7" /> Practice Details & Consultation Fee
          </h3>

          <form onSubmit={handleProfileSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Consultation Fee ($ USD)</label>
                <input
                  type="number"
                  className="form-control"
                  value={profile.consultationFee}
                  onChange={(e) => setProfile({ ...profile, consultationFee: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hospital or Clinic Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.hospitalName}
                  onChange={(e) => setProfile({ ...profile, hospitalName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Clinic Street Address</label>
              <input
                type="text"
                className="form-control"
                value={profile.hospitalAddress}
                onChange={(e) => setProfile({ ...profile, hospitalAddress: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Clinic Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={profile.hospitalPhone}
                  onChange={(e) => setProfile({ ...profile, hospitalPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Biography</label>
              <textarea
                className="form-control"
                rows="3"
                value={profile.biography}
                onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              <Save size={15} /> Save Practice Profile
            </button>
          </form>
        </div>

        {/* Availability Management */}
        <div className="card">
          <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#0d9488" /> Weekly Working Schedule & Time Slots
          </h3>

          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            Select your active working days. MediConnect automatically partitions your day into 30-minute consultation slots.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
            {days.map(d => {
              const active = availability.some(a => a.day_of_week === d.num);
              return (
                <div key={d.num} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 18px',
                  background: active ? '#f0fdfa' : '#f8fafc',
                  border: `1.5px solid ${active ? '#99f6e4' : '#e2e8f0'}`,
                  borderRadius: '10px'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{d.name}</span>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                      {active ? '09:00 AM - 05:00 PM (Lunch break 01:00 PM - 02:00 PM)' : 'Day Off / Unavailable'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAvailabilityToggle(d.num)}
                    className={`btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {active ? 'Working Day' : 'Mark Available'}
                  </button>
                </div>
              );
            })}
          </div>

          <button onClick={handleSaveAvailability} disabled={saving} className="btn btn-primary btn-sm">
            <Save size={15} /> Update Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
