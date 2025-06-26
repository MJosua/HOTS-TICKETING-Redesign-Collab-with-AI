
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MeetingRoomForm from './fields/MeetingRoomForm';
import { useAppDispatch } from '@/hooks/useAppSelector';
import { createTicket } from '@/store/slices/ticketsSlice';
import { useToast } from '@/hooks/use-toast';

const MeetingRoomService: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      // Map meeting room data to ticket format
      const ticketData = {
        subject: data.subject,
        cstm_col1: data.date,
        lbl_col1: 'Booking Date',
        cstm_col2: data.startTime,
        lbl_col2: 'Start Time',
        cstm_col3: data.endTime,
        lbl_col3: 'End Time',
        cstm_col4: data.roomOnly,
        lbl_col4: 'Room',
        cstm_col5: data.purpose,
        lbl_col5: 'Meeting Purpose',
        cstm_col6: data.attendeeCount,
        lbl_col6: 'Number of Attendees',
        cstm_col7: data.notes,
        lbl_col7: 'Additional Notes',
        cstm_col8: data.bookingDateTime,
        lbl_col8: 'Full Booking Details'
      };

      // Create ticket with meeting room service ID (you might need to adjust this)
      const result = await dispatch(createTicket({ 
        serviceId: 'meeting-room', // This should match your service catalog
        ticketData 
      })).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: "Your meeting room booking request has been submitted successfully!",
          variant: "default",
        });
        navigate('/my-tickets');
      } else {
        throw new Error(result.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Booking submission error:', error);
      toast({
        title: "Submission Error",
        description: error.message || "Failed to submit your booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/service-catalog')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Service Catalog
        </Button>
        <div className="px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <span className="mr-2">🏢</span>
          Meeting Room Booking Service
        </div>
      </div>

      {/* Service Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Meeting Room Booking System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm">Easy date selection</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm">Real-time availability</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span className="text-sm">Multiple room options</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="text-sm">Approval workflow</span>
            </div>
          </div>
          <p className="text-gray-600">
            Book meeting rooms with real-time availability checking. All bookings go through an approval process 
            and you'll receive email notifications upon approval or rejection.
          </p>
        </CardContent>
      </Card>

      {/* Meeting Room Form */}
      <MeetingRoomForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
};

export default MeetingRoomService;
