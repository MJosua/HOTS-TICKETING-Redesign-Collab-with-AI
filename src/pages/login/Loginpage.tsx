
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

  // Single effect to handle authentication redirect
  useEffect(() => {
    // Only check authentication once the loading state is clear
    if (isLoading) return;
    
    const storedToken = localStorage.getItem('tokek');
    const shouldRedirect = isAuthenticated && (token || storedToken) && !hasNavigated.current;
    
    if (shouldRedirect) {
      console.log('User already authenticated, redirecting to service catalog');
      hasNavigated.current = true;
      navigate('/service-catalog', { replace: true });
    }
  }, [isAuthenticated, token, isLoading, navigate]);

  // Reset navigation flag when user logs out
  useEffect(() => {
    if (!isAuthenticated && !token) {
      hasNavigated.current = false;
    }
  }, [isAuthenticated, token]);

  // Reset login attempts when returning to login form
  useEffect(() => {
    if (!forgotToggle && !lockedAccount) {
      dispatch(resetLoginAttempts());
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
