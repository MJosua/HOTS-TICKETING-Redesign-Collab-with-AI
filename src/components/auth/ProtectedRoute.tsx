
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  
  // Check authentication - if we have a token in localStorage but not in Redux state yet,
  // still consider authenticated to prevent flickering
  const hasToken = token || localStorage.getItem('tokek');
  const isAuth = isAuthenticated && hasToken;

  useEffect(() => {
    // Give a brief moment for Redux state to initialize
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen while checking authentication
  if (isChecking) {
    return <AuthLoadingScreen />;
  }
  
  if (!isAuth) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
