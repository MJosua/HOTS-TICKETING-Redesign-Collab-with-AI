
import { useState, useEffect } from 'react';
import { useAppSelector } from './useAppSelector';
import axios from 'axios';

export const useTokenExpiration = () => {
  const [isTokenExpiredModalOpen, setIsTokenExpiredModalOpen] = useState(false);
  const { token, user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Close modal if user becomes unauthenticated
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setIsTokenExpiredModalOpen(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    // Set up axios interceptor to detect 401 responses
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && token && isAuthenticated) {
          // Token is expired, show modal
          setIsTokenExpiredModalOpen(true);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token, isAuthenticated]);

  const closeTokenExpiredModal = () => {
    setIsTokenExpiredModalOpen(false);
  };

  return {
    isTokenExpiredModalOpen,
    closeTokenExpiredModal,
    username: user?.username || user?.uid || '',
  };
};
