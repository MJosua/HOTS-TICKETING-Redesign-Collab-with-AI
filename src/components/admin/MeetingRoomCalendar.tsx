
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Filter } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';

interface Booking {
  id: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  bookedBy: string;
  attendeeCount: number;
  status: 'approved' | 'pending' | 'rejected';
}

const MeetingRoomCalendar: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [bookings, setBookings] = useState<Booking[]>([]);

  const rooms = ['Room A', 'Room B', 'Room C', 'Conference Hall', 'Meeting Pod 1', 'Meeting Pod 2'];
  
  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    const mockBookings: Booking[] = [
      {
        id: '1',
        room: 'Room A',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:30',
        purpose: 'Team Meeting',
        bookedBy: 'John Doe',
        attendeeCount: 6,
        status: 'approved'
      },
      {
        id: '2',
        room: 'Room B',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '14:00',
        endTime: '15:30',
        purpose: 'Client Presentation',
        bookedBy: 'Jane Smith',
        attendeeCount: 8,
        status: 'pending'
      }
    ];
    setBookings(mockBookings);
  }, []);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getBookingsForDateAndRoom = (date: Date, room: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(booking => 
      booking.date === dateStr && 
      booking.room === room &&
      (selectedRoom === 'all' || booking.room === selectedRoom)
    );
  };

  const getStatusColor = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredRooms = selectedRoom === 'all' ? rooms : [selectedRoom];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Meeting Room Calendar
            </CardTitle>
            <div className="flex items-center gap-4">
              {/* Room Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rooms</SelectItem>
                    {rooms.map(room => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Week Navigation */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium px-3">
                  {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Header Row */}
              <div className="grid grid-cols-8 border-b bg-gray-50">
                <div className="p-3 font-medium text-center">Room / Time</div>
                {weekDays.map(day => (
                  <div key={day.toISOString()} className="p-3 font-medium text-center border-l">
                    <div>{format(day, 'EEE')}</div>
                    <div className="text-sm text-gray-500">{format(day, 'MMM dd')}</div>
                  </div>
                ))}
              </div>

              {/* Room Rows */}
              {filteredRooms.map(room => (
                <div key={room} className="border-b">
                  {/* Room Header */}
                  <div className="grid grid-cols-8 bg-gray-25">
                    <div className="p-3 font-medium bg-gray-100 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {room}
                    </div>
                    {weekDays.map(day => (
                      <div key={`${room}-${day.toISOString()}`} className="p-2 border-l min-h-24">
                        <div className="space-y-1">
                          {getBookingsForDateAndRoom(day, room).map(booking => (
                            <div
                              key={booking.id}
                              className={`text-xs p-2 rounded border ${getStatusColor(booking.status)}`}
                            >
                              <div className="font-medium">{booking.startTime}-{booking.endTime}</div>
                              <div className="truncate">{booking.purpose}</div>
                              <div className="flex items-center gap-1 mt-1">
                                <Users className="w-3 h-3" />
                                <span>{booking.attendeeCount}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium">Status:</span>
            <div className="flex items-center gap-4">
              <Badge className="bg-green-100 text-green-800">Approved</Badge>
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
              <Badge className="bg-red-100 text-red-800">Rejected</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingRoomCalendar;
