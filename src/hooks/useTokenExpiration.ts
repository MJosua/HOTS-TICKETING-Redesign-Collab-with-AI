
import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './useAppSelector';
import { clearToken } from '@/store/slices/authSlice';
import axios from 'axios';

export const useTokenExpiration = () => {
  const dispatch = useAppDispatch();
  const [isTokenExpiredModalOpen, setIsTokenExpiredModalOpen] = useState(false);
  const { token, user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Close modal if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('User authenticated, closing token expired modal');
      setIsTokenExpiredModalOpen(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    // Set up axios interceptor to detect 401 responses
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && token && isAuthenticated) {
          console.log('Token expired detected, showing modal and clearing token');
          // Token is expired, clear it and show modal
          dispatch(clearToken());
          setIsTokenExpiredModalOpen(true);
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token, isAuthenticated, dispatch]);

  const closeTokenExpiredModal = () => {
    setIsTokenExpiredModalOpen(false);
  };

  return {
    isTokenExpiredModalOpen,
    closeTokenExpiredModal,
    username: user?.username || user?.uid || '',
  };
};
