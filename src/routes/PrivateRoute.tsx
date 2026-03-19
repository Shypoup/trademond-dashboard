import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Auth guard that redirects unauthenticated users to /login.
 */
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('trademond_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
