
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, token, isLoading } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Quick check - if we have clear authentication state, stop checking immediately
    const storedToken = localStorage.getItem('tokek');
    const hasValidAuth = isAuthenticated && (token || storedToken);
    
    if (hasValidAuth || (!isAuthenticated && !token && !storedToken)) {
      setIsChecking(false);
      return;
    }
    
    // Only delay if authentication state is unclear
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []); // Run only once on mount

  // Show loading screen while checking authentication or during login process
  if (isChecking || isLoading) {
    return <AuthLoadingScreen />;
  }
  
  // Check authentication - use stored token as fallback
  const storedToken = localStorage.getItem('tokek');
  const isUserAuthenticated = isAuthenticated && (token || storedToken);
  
  if (!isUserAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
