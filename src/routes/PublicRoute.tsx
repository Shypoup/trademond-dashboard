import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Guest guard that redirects authenticated users to the home page.
 */
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('trademond_token');

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
