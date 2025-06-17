
import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from './useAppSelector';
import axios from 'axios';

export const useTokenExpiration = () => {
  const [isTokenExpiredModalOpen, setIsTokenExpiredModalOpen] = useState(false);
  const { token, user, isAuthenticated } = useAppSelector((state) => state.auth);
  const interceptorRef = useRef<number | null>(null);

  // Only close modal if user becomes unauthenticated AND modal was manually closed
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Only auto-close if the modal wasn't opened due to token expiration
      // This prevents auto-closing when token expires but user hasn't logged out manually
      console.log('Auth state changed, but keeping modal state:', { isAuthenticated, token, modalOpen: isTokenExpiredModalOpen });
    }
  }, [isAuthenticated, token, isTokenExpiredModalOpen]);

  useEffect(() => {
    // Remove existing interceptor if any
    if (interceptorRef.current !== null) {
      axios.interceptors.response.eject(interceptorRef.current);
    }

    // Set up axios interceptor to detect 401 responses
    interceptorRef.current = axios.interceptors.response.use(
      (response) => {
        console.log('Successful response:', response.status);
        return response;
      },
      (error) => {
        console.log('Response error intercepted:', {
          status: error.response?.status,
          hasToken: !!token,
          isAuthenticated,
          modalCurrentlyOpen: isTokenExpiredModalOpen
        });

        // Always show modal on 401 if user has a token and is authenticated
        if (error.response?.status === 401 && token && isAuthenticated) {
          console.log('401 detected - showing token expired modal');
          setIsTokenExpiredModalOpen(true);
        }
        
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      if (interceptorRef.current !== null) {
        axios.interceptors.response.eject(interceptorRef.current);
        interceptorRef.current = null;
      }
    };
  }, [token, isAuthenticated]); // Remove isTokenExpiredModalOpen from dependencies to prevent re-creating interceptor

  const closeTokenExpiredModal = () => {
    console.log('Manually closing token expired modal');
    setIsTokenExpiredModalOpen(false);
  };

  return {
    isTokenExpiredModalOpen,
    closeTokenExpiredModal,
    username: user?.username || user?.uid || '',
  };
};
