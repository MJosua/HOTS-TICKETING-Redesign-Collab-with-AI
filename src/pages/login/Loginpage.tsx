
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { resetLoginAttempts } from '@/store/slices/authSlice';
import Loginform from './form/Loginform';
import Forgotpassform from './form/Forgotpassform';
import Lockedaccount from './form/Lockedaccount';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, isLoading } = useAppSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [forgotToggle, setForgotToggle] = useState(false);
  const [lockedAccount, setLockedAccount] = useState(false);
  
  // Use ref to prevent multiple navigation attempts
  const hasNavigated = useRef(false);

  // Check if user is already authenticated - optimize to prevent delay
  useEffect(() => {
    const hasToken = token || localStorage.getItem('tokek');
    
    // Only navigate if we have both authentication state and token, and haven't already navigated
    if (isAuthenticated && hasToken && !isLoading && !hasNavigated.current) {
      console.log('User already authenticated, redirecting to service catalog');
      hasNavigated.current = true;
      navigate('/service-catalog', { replace: true });
    }
  }, [isAuthenticated, token, isLoading, navigate]);

  // Reset navigation flag when authentication state changes
  useEffect(() => {
    if (!isAuthenticated || !token) {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, token]);

  // Reset login attempts when going back to login - debounce to prevent excessive dispatches
  useEffect(() => {
    if (!forgotToggle && !lockedAccount && !hasNavigated.current) {
      const timer = setTimeout(() => {
        dispatch(resetLoginAttempts());
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [forgotToggle, lockedAccount, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-0 to-blue-100 flex items-center justify-center p-4">
      {!forgotToggle && !lockedAccount && (
        <Loginform
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          credentials={credentials}
          setCredentials={setCredentials}
          setForgotToggle={setForgotToggle}
          setLockedAccount={setLockedAccount}
        />
      )}

      {forgotToggle && !lockedAccount && (
        <Forgotpassform
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          credentials={credentials}
          setCredentials={setCredentials}
          setForgotToggle={setForgotToggle}
        />
      )}

      {lockedAccount && (
        <Lockedaccount
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          credentials={credentials}
          setCredentials={setCredentials}
          setForgotToggle={setForgotToggle}
          setLockedAccount={setLockedAccount}
        />
      )}
    </div>
  );
};

export default Login;
