import React, { useMemo } from 'react';
import { CardContent } from '@/components/ui/card';
import { WidgetProps } from '@/types/widgetTypes';
import { useAppSelector } from '@/hooks/useAppSelector';
import { CardCollapsible } from '@/components/ui/CardCollapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

type Booking = {
  id: number;
  room: string;
  startTime: string;
  endTime: string;
  bookedBy: string;
  attendees: number;
  date: string; // Format: YYYY-MM-DD
};

const timeSlots = Array.from({ length: 18 }, (_, i) => {
  const hour = 8 + Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
});

function getNextFiveWeekdays(startDate = new Date()) {
  const days: string[] = [];
  const date = new Date(startDate);
  while (days.length < 5) {
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      days.push(date.toISOString().split('T')[0]);
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}



const GanttRoomUsageStatic: React.FC<WidgetProps> = ({ 
  ticketData, 
  formData, 
  currentDateRange, 
  widgetData, 
  isLoading, 
  error 
}) => {
  const { ticketDetail } = useAppSelector(state => state.tickets);
  const visibleDates = getNextFiveWeekdays();

  // Get booking data from the dynamic data system
  const roomData: Booking[] = widgetData?.meetingRoomBookings || [];
  
  const selectedRoom = useMemo(() => {
    // Get room from ticket detail or use first room from data
    const roomFromTicket = ticketDetail?.detail_rows?.[0]?.cstm_col;
    if (roomFromTicket) return roomFromTicket;
    
    if (roomData.length > 0) {
      return roomData[0].room;
    }
    
    return '';
  }, [ticketDetail?.detail_rows, roomData]);

  const rooms = useMemo(() => {
    return [...new Set(roomData.map((b) => b.room))];
  }, [roomData]);

  // Show loading state
  if (isLoading) {
    return (
      <CardCollapsible
        title="Loading Room Schedule..."
        description="Fetching booking data"
        defaultOpen
      >
        <CardContent className="flex flex-col space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </CardCollapsible>
    );
  }

  // Show error state
  if (error) {
    return (
      <CardCollapsible
        title="Room Schedule"
        description="Unable to load booking data"
        defaultOpen
      >
        <CardContent>
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">
              {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </CardCollapsible>
    );
  }

  // Show empty state if no data
  if (!roomData || roomData.length === 0) {
    return (
      <CardCollapsible
        title={`Room ${selectedRoom || 'Schedule'}`}
        description="No booking data available"
        defaultOpen
      >
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No bookings found for the selected date and room.
          </div>
        </CardContent>
      </CardCollapsible>
    );
  }

  const timeToIndex = (time?: string) => {
    if (!time || typeof time !== 'string') return 0;
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return (h - 8) * 2 + (m >= 30 ? 1 : 0);
  };

  return (
    <CardCollapsible
      title={`Room ${selectedRoom}`}
      description={`Booking Room Data ${ticketDetail?.detail_rows?.[1]?.cstm_col || ''}`}
      defaultOpen
    >




      <CardContent className=' flex flex-col overflow-hidden h-[576px]'>
        <div className="grid" style={{ gridTemplateColumns: `80px repeat(${visibleDates.length}, 1fr)` }}>
          {/* Time column */}
          <div className="flex flex-col overflow-hidden h-[576px]">
            {timeSlots.map((slot, idx) => (
              <div
                key={idx}
                className={`h-8 text-xs border-b flex items-center justify-end pr-2 text-muted-foreground ${Math.floor(idx / 2) % 2 === 0 ? 'bg-muted' : 'bg-white'
                  }`}
              >
                {slot}
              </div>
            ))}
          </div>

          {/* Date columns */}
          {visibleDates.map((dateStr, dateIdx) => (
            <div key={dateIdx} className="relative border-l border-gray-200">
              {/* Background stripes */}
              {timeSlots.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-8 border-b border-dashed ${Math.floor(idx / 2) % 2 === 0 ? 'bg-muted/50' : 'bg-white'
                    }`}
                ></div>
              ))}

              {/* Booking blocks */}
              {roomData
                .filter((b) => b.room === selectedRoom && b.date === dateStr)
                .map((b) => {
                  const start = timeToIndex(b.startTime);
                  const end = timeToIndex(b.endTime);
                  const span = end - start;

                  return (
                    <div
                      key={b.id}
                      className="absolute left-1 right-1 rounded-md px-2 py-1 text-xs text-white shadow"
                      style={{
                        top: `${start * 32}px`,
                        height: `${span * 32}px`,
                        backgroundColor: '#3B82F6',
                      }}
                    >
                      <div className="font-semibold">{b.bookedBy}</div>
                      <div className="text-[10px]">{b.startTime}–{b.endTime}</div>
                      <div className="text-[10px]">{b.attendees} attendees</div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>

        {/* Day Labels */}
        <div
          className="grid mt-4 text-sm font-medium text-center"
          style={{ gridTemplateColumns: `80px repeat(${visibleDates.length}, 1fr)` }}
        >
          <div></div>
          {visibleDates.map((dateStr, i) => {
            const date = new Date(dateStr);
            const label = date.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            return <div key={i}>{label}</div>;
          })}
        </div>
      </CardContent>
    </CardCollapsible>

  );
};

export default GanttRoomUsageStatic;
