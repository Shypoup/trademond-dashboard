import React from 'react';
import { Navigate } from 'react-router-dom';
import { ACCESS_TOKEN_KEY } from '@api/axiosClient';

/**
 * Guest guard that redirects authenticated users to the home page.
 */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
