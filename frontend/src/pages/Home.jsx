import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, FileText, Shield, Award, Stethoscope, ArrowRight, CheckCircle2, UserCheck, HeartPulse } from 'lucide-react';
import doctorService from '../services/doctorService';

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [featuredDoctors, setFeaturedDoctors] = useState([]);

  useEffect(() => {
    doctorService.getSpecializations().then(specs => setSpecializations(specs)).catch(() => {});
    doctorService.getDoctors().then(res => {
      if (res.doctors) setFeaturedDoctors(res.doctors.slice(0, 3));
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedSpecialty) params.append('specialization', selectedSpecialty);
    navigate(`/doctors?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 100%)',
        padding: '70px 0 80px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              background: '#ccfbf1',
              color: '#0f766e',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '20px'
            }}>
              <HeartPulse size={16} /> Intelligent Healthcare Platform
            </div>

            <h1 style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              lineHeight: 1.15,
              color: '#0f172a',
              marginBottom: '18px'
            }}>
              Seamless Doctor Appointments & <span style={{ color: '#0d9488' }}>AI Medical Summaries</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '32px'
            }}>
              MediConnect connects patients with certified specialists. Upload your historical records, let our secure AI synthesize your medical history for your doctor, and book appointments without the hassle.
            </p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/doctors" className="btn btn-primary btn-lg">
                <Search size={18} /> Find a Doctor
              </Link>
              <Link to="/role-selection" className="btn btn-secondary btn-lg">
                Join MediConnect <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          {/* Quick Search Card */}
          <div>
            <div className="card" style={{ boxShadow: 'var(--shadow-lg)', padding: '32px' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: '#0f172a' }}>
                Quick Doctor Search
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '22px' }}>
                Search by doctor name, specialty, clinic, or city.
              </p>

              <form onSubmit={handleSearch}>
                <div className="form-group">
                  <label className="form-label">Keyword or Doctor Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Dr. Jenkins, Cardiology, Seattle"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <select
                    className="form-control"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                  >
                    <option value="">All Specializations</option>
                    {specializations.map((spec, i) => (
                      <option key={i} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                  <Search size={18} /> Search Available Appointments
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Specializations Browser */}
      <section style={{ padding: '60px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Browse by Medical Specialization</h2>
            <p style={{ color: '#64748b' }}>Connect with board-certified physicians across major fields of medicine</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            {['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'General Medicine', 'Orthopedics'].map((spec, i) => (
              <div
                key={i}
                onClick={() => navigate(`/doctors?specialization=${spec}`)}
                className="card card-hover"
                style={{
                  textAlign: 'center',
                  padding: '24px 16px',
                  cursor: 'pointer',
                  borderColor: '#e2e8f0'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: '#f0fdfa',
                  color: '#0d9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px'
                }}>
                  <Stethoscope size={24} />
                </div>
                <h4 style={{ fontSize: '1rem', color: '#1e293b' }}>{spec}</h4>
                <span style={{ fontSize: '0.8rem', color: '#0284c7', marginTop: '6px', display: 'inline-block', fontWeight: 600 }}>
                  View Specialists →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How MediConnect Works */}
      <section style={{ padding: '70px 0', backgroundColor: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>How MediConnect Works</h2>
            <p style={{ color: '#64748b' }}>Streamlined medical appointment workflow with AI-assisted clinical document insight</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}>
            {/* Step 1 */}
            <div className="card" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '20px',
                background: '#0d9488',
                color: '#ffffff',
                fontWeight: 800,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>1</div>
              <div style={{ marginTop: '10px', marginBottom: '14px', color: '#0d9488' }}>
                <Search size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Find Verified Doctors</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Search approved physicians by specialty, consultation fee, and city. Inspect verified qualifications and patient reviews.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '20px',
                background: '#0284c7',
                color: '#ffffff',
                fontWeight: 800,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>2</div>
              <div style={{ marginTop: '10px', marginBottom: '14px', color: '#0284c7' }}>
                <Calendar size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Book Appointment Slot</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Pick an available working day and real-time appointment time slot. Instant database confirmation guarantees zero double-booking.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '20px',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 800,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>3</div>
              <div style={{ marginTop: '10px', marginBottom: '14px', color: '#2563eb' }}>
                <FileText size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Upload Medical PDF Records</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Optionally upload lab panels, prescriptions, or discharge records into your private, encrypted health records vault.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '-15px',
                left: '20px',
                background: '#10b981',
                color: '#ffffff',
                fontWeight: 800,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>4</div>
              <div style={{ marginTop: '10px', marginBottom: '14px', color: '#10b981' }}>
                <Shield size={32} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>AI Clinical Summary & Consent</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Review a structured 9-section clinical history summary. Authorize secure sharing with your doctor before the consultation starts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '70px 0', backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            {/* Patients benefits */}
            <div className="card" style={{ borderLeft: '5px solid #0d9488', padding: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <UserCheck size={26} color="#0d9488" />
                <h3 style={{ fontSize: '1.4rem' }}>Benefits for Patients</h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#475569' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Effortlessly find verified doctors with upfront consultation fees and genuine patient reviews.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Centralized vault for lab reports, discharge summaries, and historical prescriptions.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Granular privacy controls: explicitly grant or revoke doctor access to your records at any time.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>No need to re-explain your entire medical history during every single doctor appointment.</span>
                </li>
              </ul>
              <div style={{ marginTop: '24px' }}>
                <Link to="/patient/register" className="btn btn-outline" style={{ width: '100%' }}>
                  Create Free Patient Account
                </Link>
              </div>
            </div>

            {/* Doctors benefits */}
            <div className="card" style={{ borderLeft: '5px solid #0284c7', padding: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Award size={26} color="#0284c7" />
                <h3 style={{ fontSize: '1.4rem' }}>Benefits for Doctors</h3>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem', color: '#475569' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Pre-consultation 9-section structured summary of patient history, saving valuable consultation minutes.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Automated extraction highlights critical medications, documented allergies, and conflicting clinical records.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Complete availability management: set working days, time slots, break times, and consultation modes.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Dedicated provider dashboard with appointment tracking, patient records access, and private clinical notes.</span>
                </li>
              </ul>
              <div style={{ marginTop: '24px' }}>
                <Link to="/doctor/register" className="btn btn-primary" style={{ width: '100%' }}>
                  Register as a Healthcare Provider
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #0d9488, #0284c7)',
        padding: '60px 0',
        color: '#ffffff',
        textAlign: 'center'
      }}>
        <div className="container" style={{ maxWidth: '750px' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#ffffff', marginBottom: '16px' }}>
            Ready for a Modern Healthcare Experience?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: '1.6', marginBottom: '30px' }}>
            Join thousands of patients and licensed medical specialists using MediConnect for reliable appointment scheduling and AI-assisted clinical records management.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/doctors" className="btn btn-secondary btn-lg" style={{ color: '#0f172a' }}>
              Book an Appointment
            </Link>
            <Link to="/role-selection" className="btn btn-outline btn-lg" style={{ borderColor: '#ffffff', color: '#ffffff' }}>
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
