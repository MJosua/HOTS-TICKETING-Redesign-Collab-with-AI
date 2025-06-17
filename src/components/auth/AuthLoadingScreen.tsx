
import React from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-0 to-blue-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" className="text-blue-600" />
        <p className="text-gray-600">Checking authentication...</p>
      </div>
    </div>
  );
};
