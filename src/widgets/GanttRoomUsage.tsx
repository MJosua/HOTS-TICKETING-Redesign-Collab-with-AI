import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { WidgetProps } from '@/types/widgetTypes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_URL } from '@/config/sourceConfig';

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

const GanttRoomUsage: React.FC<WidgetProps> = ({ ticketData, formData, currentDateRange }) => {
  const [roomData, setRoomData] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const visibleDates = getNextFiveWeekdays();

  const getData_meeting_room = () => {
    axios.get(`${API_URL}/hots_settings/get/meetingroom`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("tokek")}`,
      },
    })
      .then((res) => {
        const rawData = res.data.data;

        const formattedData: Booking[] = rawData.map((item: any) => ({
          id: item.ticket_id,
          room: item.room,
          startTime: item.start_time,  // map snake_case to camelCase
          endTime: item.end_time,
          bookedBy: String(item.booked_by),
          attendees: Number(item.attendees),
          date: item.date,
        }));

        setRoomData(formattedData);
        if (formattedData.length > 0) {
          setSelectedRoom(formattedData[0].room);
        }
        console.log("rawData", rawData)
      })
      .catch((err) => {
        console.error("Error fetching meeting room data:", err);
      });
  };

  useEffect(() => {
    getData_meeting_room();
  }, []);

  const rooms = useMemo(() => {
    return [...new Set(roomData.map((b) => b.room))];
  }, [roomData]);

  const timeToIndex = (time?: string) => {
    if (!time || typeof time !== 'string') return 0;
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return 0;
    return (h - 8) * 2 + (m >= 30 ? 1 : 0);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg pe-1">Room Usage</CardTitle>
          </div>

          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger>
              <SelectValue placeholder="Select room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key={1} value="ANZPAC">
                ANZPAC
              </SelectItem>
              <SelectItem key={2} value="ASIA">
                ASIA
              </SelectItem>
              <SelectItem key={3} value="SNACK">
                SNACK
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedRoom} — Current bookings across next 5 weekdays
        </p>
      </CardHeader>

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
    </Card>
  );
};

export default GanttRoomUsage;
