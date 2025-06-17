
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TokenExpiredModal from './TokenExpiredModal';
import { useTokenExpiration } from '@/hooks/useTokenExpiration';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { logoutUser } from '@/store/slices/authSlice';

const TokenExpiredModalWrapper: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isTokenExpiredModalOpen, closeTokenExpiredModal, username } = useTokenExpiration();

  const handleNavigateToLogin = () => {
    closeTokenExpiredModal();
    dispatch(logoutUser());
    navigate('/login', { replace: true });
  };

  return (
    <TokenExpiredModal
      isOpen={isTokenExpiredModalOpen}
      onClose={closeTokenExpiredModal}
      onNavigateToLogin={handleNavigateToLogin}
      username={username}
    />
  );
};

export default TokenExpiredModalWrapper;
