
import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, token, isLoading } = useAppSelector((state) => state.auth);
  const [isChecking, setIsChecking] = useState(true);
  
  // Memoize authentication check to prevent unnecessary re-calculations
  const authStatus = useMemo(() => {
    const hasToken = token || localStorage.getItem('tokek');
    const isAuth = isAuthenticated && hasToken;
    
    return {
      isAuthenticated: isAuth,
      hasToken: !!hasToken
    };
  }, [isAuthenticated, token]);

  useEffect(() => {
    // Reduce checking time if we already have clear auth state
    const checkingDelay = authStatus.hasToken ? 100 : 200;
    
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, checkingDelay);

    return () => clearTimeout(timer);
  }, [authStatus.hasToken]);

  // Show loading screen while checking authentication or during login process
  if (isChecking || isLoading) {
    return <AuthLoadingScreen />;
  }
  
  if (!authStatus.isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
