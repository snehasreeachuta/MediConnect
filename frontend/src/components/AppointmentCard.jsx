import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, FileCheck, Shield, Star } from 'lucide-react';

export default function AppointmentCard({ appointment, isDoctor = false, onCancel = null }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="badge badge-success">Confirmed</span>;
      case 'completed':
        return <span className="badge badge-teal">Completed</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      case 'pending':
        return <span className="badge badge-warning">Pending Approval</span>;
      default:
        return <span className="badge badge-info">{status}</span>;
    }
  };

  const formatDate = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dt) => {
    if (!dt) return '';
    const d = new Date(dt);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="appointment-card">
      <div>
        <div className="appointment-header">
          <div>
            <span className="appointment-ref">{appointment.appointment_reference}</span>
            <h3 style={{ fontSize: '1.15rem', marginTop: '6px' }}>
              {isDoctor ? appointment.patient_name : appointment.doctor_name}
            </h3>
            {!isDoctor && appointment.specialization && (
              <span style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: 600 }}>
                {appointment.specialization}
              </span>
            )}
          </div>
          <div>{getStatusBadge(appointment.appointment_status)}</div>
        </div>

        <div className="appointment-body">
          <div className="appointment-time-box">
            <Calendar size={16} color="#0d9488" />
            <span>{formatDate(appointment.appointment_datetime)}</span>
            <Clock size={16} color="#0284c7" style={{ marginLeft: '8px' }} />
            <span>{formatTime(appointment.appointment_datetime)}</span>
          </div>

          {!isDoctor && appointment.hospital_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
              <MapPin size={15} />
              <span>{appointment.hospital_name}</span>
            </div>
          )}

          {/* Clinical tags */}
          <div className="appointment-tags" style={{ marginTop: '4px' }}>
            {appointment.records_uploaded && (
              <span className="badge badge-info" title="Patient uploaded medical records">
                <FileCheck size={12} /> Records Attached
              </span>
            )}
            {appointment.summary_ready && (
              <span className="badge badge-teal" title="AI clinical summary ready">
                AI Summary Ready
              </span>
            )}
            {appointment.consent_granted && (
              <span className="badge badge-success" title="Patient authorized sharing with doctor">
                <Shield size={12} /> Access Granted
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="appointment-footer">
        <Link to={`/appointments/${appointment.id}`} className="btn btn-secondary btn-sm">
          View Details
        </Link>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* Allow Review if completed and patient */}
          {!isDoctor && appointment.appointment_status === 'completed' && (
            <Link to={`/appointments/${appointment.id}/review`} className="btn btn-outline btn-sm">
              <Star size={14} /> Review Doctor
            </Link>
          )}

          {/* Allow cancel if eligible */}
          {appointment.appointment_status !== 'completed' && appointment.appointment_status !== 'cancelled' && onCancel && (
            <button onClick={() => onCancel(appointment.id)} className="btn btn-danger btn-sm">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
