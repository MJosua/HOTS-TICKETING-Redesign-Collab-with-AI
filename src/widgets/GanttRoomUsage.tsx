
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';
import { WidgetProps } from '@/types/widgetTypes';

// Sample room usage data
const sampleRoomData = [
  { id: 1, room: 'Conference Room A', startTime: '09:00', endTime: '11:00', bookedBy: 'Marketing Team', attendees: 8 },
  { id: 2, room: 'Conference Room A', startTime: '14:00', endTime: '16:00', bookedBy: 'IT Department', attendees: 5 },
  { id: 3, room: 'Meeting Room B', startTime: '10:00', endTime: '12:00', bookedBy: 'HR Team', attendees: 3 },
  { id: 4, room: 'Meeting Room B', startTime: '15:00', endTime: '17:00', bookedBy: 'Sales Team', attendees: 6 },
];

const GanttRoomUsage: React.FC<WidgetProps> = ({ 
  ticketData, 
  formData, 
  currentDateRange 
}) => {
  const today = new Date().toLocaleDateString();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg">Room Usage Schedule</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Current room bookings for {today}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sampleRoomData.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline">{booking.room}</Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                </div>
                <p className="text-sm font-medium">{booking.bookedBy}</p>
              </div>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{booking.attendees}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Available Slots:</strong> Conference Room A (12:00-14:00), Meeting Room B (08:00-10:00, 13:00-15:00)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GanttRoomUsage;
