
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, MapPin } from 'lucide-react';
import { format, parse, isAfter, isBefore, addMinutes } from 'date-fns';

interface Booking {
  id: string;
  room: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'approved' | 'pending' | 'rejected';
  bookedBy: string;
}

interface CalendarWidgetProps {
  selectedDate?: Date;
  selectedRoom?: string;
  onDateSelect: (date: Date) => void;
  onTimeSelect: (startTime: string, endTime: string) => void;
  onRoomSelect: (room: string) => void;
  availableRooms: string[];
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate,
  selectedRoom,
  onDateSelect,
  onTimeSelect,
  onRoomSelect,
  availableRooms = ['Room A', 'Room B', 'Room C', 'Conference Hall']
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Mock bookings data - in real implementation, fetch from API
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        room: 'Room A',
        startTime: '09:00',
        endTime: '10:30',
        purpose: 'Team Meeting',
        status: 'approved',
        bookedBy: 'John Doe'
      },
      {
        id: '2',
        room: 'Room A',
        startTime: '14:00',
        endTime: '15:30',
        purpose: 'Client Presentation',
        status: 'pending',
        bookedBy: 'Jane Smith'
      }
    ];
    setBookings(mockBookings);
  }, []);

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  const getRoomBookings = (room: string) => {
    return bookings.filter(booking => 
      booking.room === room && 
      selectedDate &&
      format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') // Mock same day
    );
  };

  const isTimeSlotAvailable = (time: string, room: string) => {
    const roomBookings = getRoomBookings(room);
    return roomBookings.every(booking => {
      const slotTime = parse(time, 'HH:mm', new Date());
      const startTime = parse(booking.startTime, 'HH:mm', new Date());
      const endTime = parse(booking.endTime, 'HH:mm', new Date());
      return isBefore(slotTime, startTime) || isAfter(slotTime, endTime);
    });
  };

  const handleTimeSlotClick = (time: string) => {
    if (selectedRoom && isTimeSlotAvailable(time, selectedRoom)) {
      const endTime = format(addMinutes(parse(time, 'HH:mm', new Date()), 60), 'HH:mm');
      setSelectedTimeSlot(time);
      onTimeSelect(time, endTime);
    }
  };

  const getBookingStatus = (status: string) => {
    const statusMap = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return statusMap[status as keyof typeof statusMap] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateSelect(date)}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Room Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Select Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedRoom} onValueChange={onRoomSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a room" />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedRoom && selectedDate && (
              <div className="space-y-2">
                <h4 className="font-medium">Room Availability</h4>
                <div className="grid grid-cols-3 gap-1">
                  {timeSlots.map((time) => {
                    const isAvailable = isTimeSlotAvailable(time, selectedRoom);
                    const isSelected = selectedTimeSlot === time;
                    return (
                      <Button
                        key={time}
                        variant={isSelected ? "default" : isAvailable ? "outline" : "secondary"}
                        size="sm"
                        disabled={!isAvailable}
                        onClick={() => handleTimeSlotClick(time)}
                        className={`text-xs ${!isAvailable ? 'opacity-50' : ''}`}
                      >
                        {time}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Bookings */}
      {selectedRoom && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Current Bookings - {selectedRoom}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getRoomBookings(selectedRoom).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <div className="font-medium">{booking.startTime} - {booking.endTime}</div>
                      <div className="text-gray-600">{booking.purpose}</div>
                      <div className="text-xs text-gray-500">by {booking.bookedBy}</div>
                    </div>
                  </div>
                  <Badge className={getBookingStatus(booking.status)}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
              {getRoomBookings(selectedRoom).length === 0 && (
                <p className="text-gray-500 text-center py-4">No bookings for this date</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarWidget;
