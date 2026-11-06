import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import RoleSelection from './pages/RoleSelection';
import PatientLogin from './pages/PatientLogin';
import PatientRegister from './pages/PatientRegister';
import DoctorLogin from './pages/DoctorLogin';
import DoctorRegister from './pages/DoctorRegister';
import AdminLogin from './pages/AdminLogin';
import DoctorList from './pages/DoctorList';
import DoctorDetails from './pages/DoctorDetails';
import BookAppointment from './pages/BookAppointment';
import BookingConfirmation from './pages/BookingConfirmation';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import MedicalRecords from './pages/MedicalRecords';
import AppointmentDetails from './pages/AppointmentDetails';
import DoctorProfile from './pages/DoctorProfile';
import PatientProfile from './pages/PatientProfile';
import ReviewPage from './pages/ReviewPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/patient/login" element={<PatientLogin />} />
          <Route path="/patient/register" element={<PatientRegister />} />
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/register" element={<DoctorRegister />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/doctors" element={<DoctorList />} />
          <Route path="/doctors/:id" element={<DoctorDetails />} />
          <Route path="/book-appointment/:doctorId" element={<BookAppointment />} />
          <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />

          {/* Protected Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/records"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <MedicalRecords />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments/:appointmentId/review"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <ReviewPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorProfile />
              </ProtectedRoute>
            }
          />

          {/* Shared Protected Appointment View */}
          <Route
            path="/appointments/:id"
            element={
              <ProtectedRoute allowedRoles={['patient', 'doctor', 'admin']}>
                <AppointmentDetails />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
