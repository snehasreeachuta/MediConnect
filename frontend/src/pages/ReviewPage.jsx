import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, CheckCircle2, ArrowLeft } from 'lucide-react';
import appointmentService from '../services/appointmentService';
import reviewService from '../services/reviewService';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

export default function ReviewPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    appointmentService.getAppointmentById(appointmentId)
      .then(appt => setAppointment(appt))
      .catch(err => setError(err.response?.data?.message || 'Appointment not found.'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await reviewService.submitReview({
        appointmentId: Number(appointmentId),
        rating,
        reviewText
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Checking appointment eligibility..." fullScreen />;

  if (success) {
    return (
      <div style={{ padding: '60px 0', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <div className="container" style={{ maxWidth: '540px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '48px 32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#ecfdf5',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px'
            }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Review Submitted</h2>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Thank you for sharing your genuine feedback. Your review helps maintain high healthcare standards on MediConnect.
            </p>
            <Link to="/patient/dashboard" className="btn btn-primary" style={{ width: '100%' }}>
              Back to Patient Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0 60px' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <div style={{ marginBottom: '20px' }}>
          <Link to="/patient/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#64748b' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        <div className="card">
          <div style={{ marginBottom: '20px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
            <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Leave a Doctor Review</h1>
            <p style={{ color: '#64748b', fontSize: '0.92rem', marginTop: '4px' }}>
              Consultation with {appointment?.doctor_name} ({appointment?.specialization})
            </p>
          </div>

          <Notification type="error" message={error} onClose={() => setError(null)} />

          <form onSubmit={handleSubmit}>
            {/* Star Rating Selector */}
            <div className="form-group" style={{ marginBottom: '24px', alignItems: 'center', textAlign: 'center' }}>
              <label className="form-label" style={{ marginBottom: '12px', fontSize: '1rem' }}>
                How would you rate your consultation experience?
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <Star
                      size={36}
                      fill={(hoverRating || rating) >= star ? '#eab308' : '#e2e8f0'}
                      color={(hoverRating || rating) >= star ? '#eab308' : '#cbd5e1'}
                    />
                  </button>
                ))}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#854d0e', marginTop: '8px' }}>
                {rating === 5 && 'Excellent - Highly Recommended'}
                {rating === 4 && 'Very Good - Thorough Consultation'}
                {rating === 3 && 'Average - Met Expectations'}
                {rating === 2 && 'Below Average'}
                {rating === 1 && 'Poor Experience'}
              </span>
            </div>

            {/* Written Review */}
            <div className="form-group">
              <label className="form-label">Written Feedback (Optional)</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Share your experience regarding the doctor's communication, punctuality, and care..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
              {submitting ? 'Submitting...' : 'Post Verified Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
