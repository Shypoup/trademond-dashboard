import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '@api/axiosClient';

/**
 * Auth guard that redirects unauthenticated users to /login.
 */
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
