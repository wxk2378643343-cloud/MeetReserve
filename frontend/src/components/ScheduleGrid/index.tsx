import React from 'react';
import type { Booking, Room } from '@/types';
import { timeToIndex, slotCount } from '@/utils/time';

const CELL_WIDTH = 52;
const START = '08:00';
const SLOT_MINUTES = 30;

interface Props {
  rooms: Room[];
  bookings: Booking[];
  currentUserId?: number;
  date: string;
  onSlotClick: (room: Room, startTime: string) => void;
  onBookingClick: (booking: Booking) => void;
}

const ScheduleGrid: React.FC<Props> = ({
  rooms,
  bookings,
  currentUserId,
  onSlotClick,
  onBookingClick,
}) => {
  const slots: string[] = [];
  for (let h = 8; h < 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = 8 * 60;
  const showNowLine = true;
  const nowLeft =
    ((nowMinutes - startMinutes) / SLOT_MINUTES) * CELL_WIDTH;

  return (
    <div className="schedule-grid-wrapper">
      <div className="schedule-grid">
        <div className="schedule-grid-header">
          <div className="schedule-grid-corner">会议室</div>
          {slots.map((t) => (
            <div
              key={t}
              className={`schedule-grid-time-cell ${t.endsWith(':00') ? 'hour-mark' : ''}`}
              style={{ width: CELL_WIDTH }}
            >
              {t.endsWith(':00') ? t : ''}
            </div>
          ))}
        </div>

        {rooms.map((room) => {
          const roomBookings = bookings.filter((b) => b.roomId === room.id);
          return (
            <div key={room.id} className="schedule-grid-row">
              <div className="schedule-grid-room-label">
                <div className="schedule-grid-room-name">{room.name}</div>
                <div className="schedule-grid-room-meta">
                  {room.location || '-'} · 👥 {room.capacity}
                </div>
              </div>
              <div className="schedule-grid-track" style={{ width: slots.length * CELL_WIDTH }}>
                {slots.map((t, idx) => (
                  <div
                    key={t}
                    className="schedule-grid-slot"
                    style={{ left: idx * CELL_WIDTH, width: CELL_WIDTH }}
                    onClick={() => onSlotClick(room, t)}
                  />
                ))}
                {roomBookings.map((b) => {
                  const left = timeToIndex(b.startTime.slice(0, 5), START, SLOT_MINUTES) * CELL_WIDTH;
                  const width = slotCount(b.startTime.slice(0, 5), b.endTime.slice(0, 5), SLOT_MINUTES) * CELL_WIDTH;
                  const isMine = b.userId === currentUserId;
                  return (
                    <div
                      key={b.id}
                      className={`schedule-booking-block ${isMine ? 'mine' : 'other'}`}
                      style={{ left, width: Math.max(width, CELL_WIDTH) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingClick(b);
                      }}
                      title={`${b.userName} · ${b.title}`}
                    >
                      <div style={{ fontWeight: 600 }}>{b.userName}</div>
                      <div>{b.title}</div>
                    </div>
                  );
                })}
                {showNowLine && nowLeft >= 0 && nowLeft <= slots.length * CELL_WIDTH && (
                  <div
                    style={{
                      position: 'absolute',
                      left: nowLeft,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: '#E60012',
                      zIndex: 1,
                      pointerEvents: 'none',
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleGrid;
