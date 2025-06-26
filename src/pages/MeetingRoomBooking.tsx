
import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import MeetingRoomService from '@/components/forms/MeetingRoomService';

const MeetingRoomBooking: React.FC = () => {
  return (
    <AppLayout>
      <MeetingRoomService />
    </AppLayout>
  );
};

export default MeetingRoomBooking;
