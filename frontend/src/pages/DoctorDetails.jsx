import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Building, Award, Calendar, Clock, CheckCircle2, Phone, Stethoscope } from 'lucide-react';
import doctorService from '../services/doctorService';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DoctorDetails() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    doctorService.getDoctorById(id)
      .then(res => {
        setDoctor(res.doctor);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Doctor not found.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading doctor profile..." fullScreen />;
  if (error || !doctor) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>{error || 'Doctor Not Found'}</h2>
        <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Back to Doctor Directory
        </Link>
      </div>
    );
  }

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum] || `Day ${dayNum}`;
  };

  return (
    <div style={{ padding: '36px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Doctor Header Banner */}
        <div className="doctor-profile-header">
          <div className="doctor-profile-avatar">
            {doctor.full_name?.replace('Dr.', '').trim().slice(0, 2).toUpperCase() || 'DR'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.85rem' }}>{doctor.full_name}</h1>
              <span className="badge badge-teal">
                <CheckCircle2 size={13} /> Verified Specialist
              </span>
            </div>

            <div style={{ fontSize: '1.05rem', color: '#0d9488', fontWeight: 600, marginBottom: '4px' }}>
              {doctor.specialization}
            </div>

            <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '12px' }}>
              {doctor.qualifications} • {doctor.experience_years} years clinical experience
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span className="rating-badge" style={{ padding: '4px 10px', fontSize: '0.9rem' }}>
                <Star size={16} fill="#eab308" color="#eab308" />
                {Number(doctor.average_rating) > 0 ? Number(doctor.average_rating).toFixed(1) : 'New'}
              </span>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Based on {doctor.total_reviews} verified consultations
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Consultation Fee
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-heading)', margin: '4px 0 16px' }}>
              ${Number(doctor.consultation_fee).toFixed(2)}
            </div>
            <Link to={`/book-appointment/${doctor.id}`} className="btn btn-primary">
              <Calendar size={16} /> Book Appointment
            </Link>
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '28px' }}>
          {/* Main Info */}
          <div>
            {/* Biography */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Stethoscope size={18} color="#0d9488" /> Professional Biography
              </h3>
              <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '0.95rem' }}>
                {doctor.biography || 'Board-certified medical practitioner dedicated to providing patient-centered healthcare.'}
              </p>
            </div>

            {/* Hospital & Location */}
            <div className="card" style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} color="#0284c7" /> Hospital & Practice Location
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.93rem', color: '#475569' }}>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>
                  {doctor.hospital_name}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin size={16} color="#64748b" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <span>{doctor.hospital_address}, {doctor.city}, {doctor.state} {doctor.postal_code}</span>
                </div>
                {doctor.hospital_phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} color="#64748b" />
                    <span>Clinic Phone: {doctor.hospital_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Patient Reviews */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={18} color="#eab308" /> Patient Reviews & Ratings
              </h3>

              {doctor.reviews && doctor.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {doctor.reviews.map(rev => (
                    <div key={rev.id} style={{
                      padding: '14px 16px',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rev.patient_name}</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < rev.rating ? '#eab308' : '#e2e8f0'}
                              color={i < rev.rating ? '#eab308' : '#e2e8f0'}
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        {rev.review_text || 'Consultation completed smoothly.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  No reviews submitted yet for this doctor. Be the first to leave feedback after your appointment!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar Availability Schedule */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#0d9488" /> Consultation Hours
              </h3>

              {doctor.availability && doctor.availability.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {doctor.availability.map(slot => (
                    <div key={slot.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.88rem',
                      paddingBottom: '8px',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>
                        {getDayName(slot.day_of_week)}
                      </span>
                      <span style={{ color: '#0d9488', fontWeight: 600 }}>
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
                  Standard Monday - Friday hours (09:00 - 17:00).
                </p>
              )}

              <div style={{ marginTop: '24px' }}>
                <Link to={`/book-appointment/${doctor.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                  <Calendar size={16} /> Schedule Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
