
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  
  // Check authentication - if we have a token in localStorage but not in Redux state yet,
  // still consider authenticated to prevent flickering
  const hasToken = token || localStorage.getItem('tokek');
  const isAuth = isAuthenticated && hasToken;
  
  if (!isAuth) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
