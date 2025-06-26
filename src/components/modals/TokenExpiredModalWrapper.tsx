
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TokenExpiredModal from './TokenExpiredModal';
import { useTokenExpiration } from '@/hooks/useTokenExpiration';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logoutUser } from '@/store/slices/authSlice';

interface TokenExpiredModalWrapperProps {
  children: React.ReactNode;
}

const TokenExpiredModalWrapper: React.FC<TokenExpiredModalWrapperProps> = ({ children }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isTokenExpiredModalOpen, closeTokenExpiredModal, username } = useTokenExpiration();

  const handleNavigateToLogin = async () => {
    // First dispatch logout to clear Redux state
    await dispatch(logoutUser());
    
    // Close the modal
    closeTokenExpiredModal();
    
    // Then navigate to login
    navigate('/login', { replace: true });
  };

  return (
    <>
      {children}
      <TokenExpiredModal
        isOpen={isTokenExpiredModalOpen}
        onClose={closeTokenExpiredModal}
        onNavigateToLogin={handleNavigateToLogin}
        username={username}
      />
    </>
  );
};

export default TokenExpiredModalWrapper;
