import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw, Stethoscope } from 'lucide-react';
import doctorService from '../services/doctorService';
import DoctorCard from '../components/DoctorCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DoctorList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state initialized from URL query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [maxFee, setMaxFee] = useState(searchParams.get('maxFee') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');

  useEffect(() => {
    doctorService.getSpecializations().then(specs => setSpecializations(specs)).catch(() => {});
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (specialization) params.specialization = specialization;
      if (city) params.city = city;
      if (maxFee) params.maxFee = maxFee;
      if (minRating) params.minRating = minRating;

      const res = await doctorService.getDoctors(params);
      setDoctors(res.doctors || []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialization]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleReset = () => {
    setSearch('');
    setSpecialization('');
    setCity('');
    setMaxFee('');
    setMinRating('');
    setSearchParams({});
    doctorService.getDoctors().then(res => setDoctors(res.doctors || []));
  };

  return (
    <div className="doctor-directory-page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '8px' }}>
            Find Healthcare Specialists
          </h1>
          <p style={{ color: '#64748b' }}>
            Browse verified medical doctors, inspect availability, review credentials, and schedule your appointment.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="search-filter-bar">
          <form onSubmit={handleFilterSubmit}>
            <div className="filter-grid">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Doctor Name or Keyword</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '36px' }}
                    placeholder="Search doctor or clinic..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Specialization</label>
                <select
                  className="form-control"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                >
                  <option value="">All Specializations</option>
                  {specializations.map((spec, i) => (
                    <option key={i} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Seattle, San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Max Fee ($)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Any fee"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Min Rating</label>
                <select
                  className="form-control"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4.0">4.0+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button type="button" onClick={handleReset} className="btn btn-secondary btn-sm">
                <RotateCcw size={14} /> Reset
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <Filter size={14} /> Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Doctor Grid */}
        {loading ? (
          <LoadingSpinner message="Locating approved healthcare providers..." />
        ) : doctors.length > 0 ? (
          <div className="doctor-grid">
            {doctors.map(doctor => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Stethoscope size={28} />
            </div>
            <h3>No Doctors Found</h3>
            <p style={{ marginTop: '8px', maxWidth: '450px', margin: '8px auto 20px' }}>
              No verified doctors match your selected filters. Try broadening your criteria or reset the search filters.
            </p>
            <button onClick={handleReset} className="btn btn-outline btn-sm">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
