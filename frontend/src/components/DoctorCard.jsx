import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Building, Award, Calendar } from 'lucide-react';

export default function DoctorCard({ doctor }) {
  const getInitials = (name) => {
    if (!name) return 'DR';
    return name.replace('Dr.', '').trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="doctor-card">
      <div>
        <div className="doctor-card-header">
          <div className="doctor-avatar">
            {getInitials(doctor.full_name)}
          </div>
          <div className="doctor-meta">
            <h3>{doctor.full_name}</h3>
            <div className="doctor-specialty">{doctor.specialization}</div>
            <div className="doctor-qualifications">{doctor.qualifications}</div>
          </div>
        </div>

        <div className="doctor-details-list">
          <div className="doctor-detail-item">
            <Award size={16} color="#0d9488" />
            <span>{doctor.experience_years} years experience</span>
          </div>
          <div className="doctor-detail-item">
            <Building size={16} color="#0284c7" />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {doctor.hospital_name}
            </span>
          </div>
          <div className="doctor-detail-item">
            <MapPin size={16} color="#64748b" />
            <span>{doctor.city}, {doctor.state}</span>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div className="doctor-fee">
            <span className="fee-label">Consultation Fee</span>
            <span className="fee-amount">${Number(doctor.consultation_fee).toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="rating-badge">
              <Star size={14} fill="#eab308" color="#eab308" />
              {Number(doctor.average_rating) > 0 ? Number(doctor.average_rating).toFixed(1) : 'New'}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              ({doctor.total_reviews} reviews)
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Link to={`/doctors/${doctor.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            View Profile
          </Link>
          <Link to={`/book-appointment/${doctor.id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
            <Calendar size={14} /> Book
          </Link>
        </div>
      </div>
    </div>
  );
}
