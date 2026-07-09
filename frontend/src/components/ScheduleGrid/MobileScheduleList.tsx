import type { Booking, Room } from '@/types';
import { Button, Tag, Empty } from 'antd';
import { PlusOutlined, EnvironmentOutlined, TeamOutlined } from '@ant-design/icons';

interface Props {
  rooms: Room[];
  bookings: Booking[];
  currentUserId?: number;
  onSlotClick: (room: Room, startTime: string) => void;
  onBookingClick: (booking: Booking) => void;
  onBookRoom: (room: Room) => void;
}

function MobileScheduleList({
  rooms,
  bookings,
  currentUserId,
  onBookingClick,
  onBookRoom,
}: Props) {
  if (rooms.length === 0) {
    return (
      <div className="mobile-schedule-empty">
        <Empty description="暂无可用会议室" />
      </div>
    );
  }

  return (
    <div className="mobile-schedule-list">
      {rooms.map((room) => {
        const roomBookings = bookings
          .filter((b) => b.roomId === room.id && b.status === 'ACTIVE')
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        return (
          <div key={room.id} className="mobile-room-card">
            <div className="mobile-room-header">
              <div>
                <div className="mobile-room-name">{room.name}</div>
                <div className="mobile-room-meta">
                  {room.location && (
                    <span>
                      <EnvironmentOutlined /> {room.location}
                    </span>
                  )}
                  <span>
                    <TeamOutlined /> {room.capacity}人
                  </span>
                </div>
              </div>
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => onBookRoom(room)}
              >
                预约
              </Button>
            </div>

            {roomBookings.length === 0 ? (
              <div className="mobile-room-free">今日暂无预约，全天空闲</div>
            ) : (
              <div className="mobile-booking-list">
                {roomBookings.map((b) => {
                  const isMine = b.userId === currentUserId;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      className={`mobile-booking-item ${isMine ? 'mine' : ''}`}
                      onClick={() => onBookingClick(b)}
                    >
                      <div className="mobile-booking-time">
                        {b.startTime.slice(0, 5)} - {b.endTime.slice(0, 5)}
                      </div>
                      <div className="mobile-booking-info">
                        <span className="mobile-booking-title">{b.title}</span>
                        <Tag color={isMine ? 'red' : 'default'} bordered={false}>
                          {b.userName}
                        </Tag>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default MobileScheduleList;
