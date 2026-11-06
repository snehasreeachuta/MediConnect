import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Building, DollarSign, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import doctorService from '../services/doctorService';
import appointmentService from '../services/appointmentService';
import authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [patientNotes, setPatientNotes] = useState('');

  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Set default date to tomorrow in YYYY-MM-DD
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().slice(0, 10);
    setSelectedDate(dateStr);
  }, []);

  // Fetch Doctor info
  useEffect(() => {
    doctorService.getDoctorById(doctorId)
      .then(res => setDoctor(res.doctor))
      .catch(err => setError(err.response?.data?.message || 'Failed to load doctor details.'))
      .finally(() => setLoadingDoctor(false));
  }, [doctorId]);

  // Fetch Slots when Date changes
  useEffect(() => {
    if (!selectedDate || !doctorId) return;

    setLoadingSlots(true);
    setSelectedSlot(null);

    doctorService.getDoctorAvailability(doctorId, selectedDate)
      .then(res => {
        setAvailableSlots(res.availableSlots || []);
      })
      .catch(err => {
        console.error('Failed to load slots:', err);
        setAvailableSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, doctorId]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) {
      return setError('Please choose an available appointment time slot.');
    }

    if (!authService.isAuthenticated()) {
      navigate('/patient/login', { state: { from: `/book-appointment/${doctorId}` } });
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await appointmentService.createAppointment({
        doctorId: Number(doctorId),
        appointmentDatetime: selectedSlot.startDatetime,
        patientNotes
      });

      // Redirect to Confirmation page
      navigate(`/booking-confirmation/${res.appointment.id}`, {
        state: { appointment: res.appointment }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. This time slot may have just been reserved by another patient.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingDoctor) return <LoadingSpinner message="Loading doctor calendar..." fullScreen />;

  return (
    <div className="booking-page">
      <div className="container" style={{ maxWidth: '1050px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '8px' }}>
            Schedule Consultation
          </h1>
          <p style={{ color: '#64748b' }}>
            Select your preferred consultation date and available time slot.
          </p>
        </div>

        <Notification type="error" message={error} onClose={() => setError(null)} />

        <div className="booking-layout">
          {/* Left: Booking Steps */}
          <div>
            <form onSubmit={handleBookingSubmit}>
              {/* Step 1: Date Selection */}
              <div className="booking-step-card">
                <div className="step-indicator">
                  <div className="step-number">1</div>
                  <div className="step-title">Select Consultation Date</div>
                </div>

                <div className="form-group" style={{ maxWidth: '320px' }}>
                  <label className="form-label">Date (Upcoming Days)</label>
                  <input
                    type="date"
                    className="form-control"
                    min={new Date().toISOString().slice(0, 10)}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Step 2: Time Slot Selection */}
              <div className="booking-step-card">
                <div className="step-indicator">
                  <div className="step-number">2</div>
                  <div className="step-title">Choose an Available Time Slot</div>
                </div>

                {loadingSlots ? (
                  <LoadingSpinner message="Calculating available schedule slots..." />
                ) : availableSlots.length > 0 ? (
                  <div>
                    <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '12px' }}>
                      Showing remaining available consultation slots for {selectedDate}:
                    </p>
                    <div className="slots-grid">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => setSelectedSlot(slot)}
                          className={`slot-btn ${selectedSlot?.time === slot.time ? 'selected' : ''}`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', textAlign: 'center' }}>
                    Doctor is not available for appointments on this date. Please pick another day.
                  </div>
                )}
              </div>

              {/* Step 3: Patient Notes */}
              <div className="booking-step-card">
                <div className="step-indicator">
                  <div className="step-number">3</div>
                  <div className="step-title">Reason for Visit / Patient Notes (Optional)</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Describe any symptoms or chief concerns</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="e.g. Follow-up consultation for blood pressure medication, mild palpitations after running..."
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                  ></textarea>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!selectedSlot || submitting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '24px' }}
              >
                {submitting ? 'Reserving Slot...' : (
                  <>
                    Confirm & Book Appointment <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Booking Summary Sidebar */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                Appointment Summary
              </h3>

              {doctor && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Doctor
                    </span>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', marginTop: '2px' }}>
                      {doctor.full_name}
                    </div>
                    <span style={{ color: '#0d9488', fontWeight: 600 }}>{doctor.specialization}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Clinic Location
                    </span>
                    <div style={{ color: '#334155', marginTop: '2px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                      <Building size={15} style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span>{doctor.hospital_name}, {doctor.city}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      Scheduled Date & Time
                    </span>
                    <div style={{ color: '#0f172a', fontWeight: 600, marginTop: '2px' }}>
                      {selectedDate} {selectedSlot ? `at ${selectedSlot.time}` : '(Select a slot)'}
                    </div>
                  </div>

                  <div style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontWeight: 700 }}>Consultation Fee</span>
                    <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0d9488' }}>
                      ${Number(doctor.consultation_fee).toFixed(2)}
                    </span>
                  </div>

                  <div style={{
                    background: '#f0fdfa',
                    border: '1px solid #ccfbf1',
                    borderRadius: '8px',
                    padding: '12px',
                    fontSize: '0.82rem',
                    color: '#0f766e',
                    lineHeight: '1.5'
                  }}>
                    <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Zero double-booking protection: Your slot is locked instantly upon confirmation.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
