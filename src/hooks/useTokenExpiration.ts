
import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from './useAppSelector';
import { clearToken } from '@/store/slices/authSlice';
import axios from 'axios';

export const useTokenExpiration = () => {
  const dispatch = useAppDispatch();
  const [isTokenExpiredModalOpen, setIsTokenExpiredModalOpen] = useState(false);
  const { token, user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  // Use ref to prevent multiple token expiration triggers
  const hasTriggeredExpiration = useRef(false);
  const interceptorId = useRef<number | null>(null);

  // Close modal if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('User authenticated, closing token expired modal');
      setIsTokenExpiredModalOpen(false);
      hasTriggeredExpiration.current = false;
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    // Remove existing interceptor if any
    if (interceptorId.current !== null) {
      axios.interceptors.response.eject(interceptorId.current);
    }

    // Set up new axios interceptor
    interceptorId.current = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only trigger token expiration once per session
        if (error.response?.status === 401 && 
            token && 
            isAuthenticated && 
            !hasTriggeredExpiration.current) {
          
          console.log('Token expired detected, showing modal and clearing token');
          hasTriggeredExpiration.current = true;
          
          // Token is expired, clear it and show modal
          dispatch(clearToken());
          setIsTokenExpiredModalOpen(true);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      if (interceptorId.current !== null) {
        axios.interceptors.response.eject(interceptorId.current);
      }
    };
  }, [token, isAuthenticated, dispatch]);

  const closeTokenExpiredModal = () => {
    setIsTokenExpiredModalOpen(false);
    hasTriggeredExpiration.current = false;
  };

  return {
    isTokenExpiredModalOpen,
    closeTokenExpiredModal,
    username: user?.username || user?.uid || '',
  };
};
