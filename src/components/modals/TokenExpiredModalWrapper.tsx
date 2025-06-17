
import React from 'react';
import { useNavigate } from 'react-router-dom';
import TokenExpiredModal from './TokenExpiredModal';
import { useTokenExpiration } from '@/hooks/useTokenExpiration';

const TokenExpiredModalWrapper: React.FC = () => {
  const navigate = useNavigate();
  const { isTokenExpiredModalOpen, closeTokenExpiredModal, username } = useTokenExpiration();

  const handleNavigateToLogin = () => {
    navigate('/login');
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
