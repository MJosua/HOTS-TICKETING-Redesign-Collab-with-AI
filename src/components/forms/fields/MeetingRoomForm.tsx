
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import CalendarWidget from './CalendarWidget';

interface MeetingRoomFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const MeetingRoomForm: React.FC<MeetingRoomFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    purpose: '',
    attendeeCount: '',
    notes: ''
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showCalendar, setShowCalendar] = useState(true);

  const availableRooms = [
    'Room A (Capacity: 8)',
    'Room B (Capacity: 12)',
    'Room C (Capacity: 6)',
    'Conference Hall (Capacity: 20)',
    'Meeting Pod 1 (Capacity: 4)',
    'Meeting Pod 2 (Capacity: 4)'
  ];

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, date: format(date, 'yyyy-MM-dd') }));
  };

  const handleTimeSelect = (startTime: string, endTime: string) => {
    setFormData(prev => ({ ...prev, startTime, endTime }));
  };

  const handleRoomSelect = (room: string) => {
    setFormData(prev => ({ ...prev, room }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.room || !formData.purpose) {
      alert('Please fill in all required fields');
      return;
    }

    const submissionData = {
      subject: `Meeting Room Booking - ${formData.room}`,
      ...formData,
      roomOnly: formData.room.split(' (')[0], // Extract room name without capacity
      bookingDateTime: `${formData.date} ${formData.startTime}-${formData.endTime}`,
      requestType: 'meeting_room_booking'
    };

    onSubmit(submissionData);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Widget */}
      {showCalendar && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Select Date, Time & Room
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CalendarWidget
              selectedDate={selectedDate}
              selectedRoom={formData.room}
              onDateSelect={handleDateSelect}
              onTimeSelect={handleTimeSelect}
              onRoomSelect={handleRoomSelect}
              availableRooms={availableRooms}
            />
          </CardContent>
        </Card>
      )}

      {/* Booking Form */}
      <Card>
        <CardHeader>
          <CardTitle>Meeting Room Booking Request</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>

              {/* Room Selection */}
              <div>
                <Label htmlFor="room">Room *</Label>
                <Select value={formData.room} onValueChange={(value) => handleInputChange('room', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {room}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Time */}
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>

              {/* End Time */}
              <div>
                <Label htmlFor="endTime">End Time *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
              </div>

              {/* Attendee Count */}
              <div>
                <Label htmlFor="attendeeCount">Number of Attendees</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="attendeeCount"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.attendeeCount}
                    onChange={(e) => handleInputChange('attendeeCount', e.target.value)}
                    className="pl-10"
                    placeholder="e.g., 6"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div>
                <Label htmlFor="purpose">Meeting Purpose *</Label>
                <Input
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="e.g., Team Meeting, Client Presentation"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any special requirements, equipment needed, etc."
                rows={3}
              />
            </div>

            {/* Summary */}
            {formData.date && formData.startTime && formData.endTime && formData.room && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                    <div><strong>Date:</strong> {formData.date}</div>
                    <div><strong>Time:</strong> {formData.startTime} - {formData.endTime}</div>
                    <div><strong>Room:</strong> {formData.room}</div>
                    <div><strong>Purpose:</strong> {formData.purpose}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="min-w-32">
                {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingRoomForm;
