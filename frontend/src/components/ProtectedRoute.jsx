import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const token = authService.getToken();
  const user = authService.getCurrentUser();

  if (!token || !user) {
    return <Navigate to="/role-selection" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If patient tries to access doctor route or vice versa
    if (user.role === 'patient') {
      return <Navigate to="/patient/dashboard" replace />;
    } else if (user.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
