import React, { useCallback, useEffect, useState } from 'react';
import { Button, DatePicker, Modal, Space, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ScheduleGrid from '@/components/ScheduleGrid';
import MobileScheduleList from '@/components/ScheduleGrid/MobileScheduleList';
import BookingDrawer from '@/components/BookingDrawer';
import PageHeader from '@/components/PageHeader';
import { useResponsive } from '@/hooks/useResponsive';
import { getSchedule, cancelBooking } from '@/api/booking';
import type { Booking, Room, ScheduleData } from '@/types';
import { useAppSelector } from '@/store/hooks';
import { formatDate, timeToIndex, indexToTime } from '@/utils/time';
import { message } from '@/utils/message';

function SchedulePage() {
  const { user } = useAppSelector((s) => s.auth);
  const { isMobile } = useResponsive();
  const [date, setDate] = useState(dayjs());
  const [data, setData] = useState<ScheduleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerInitial, setDrawerInitial] = useState<{
    roomId?: number;
    bookingDate?: string;
    startTime?: string;
    endTime?: string;
    booking?: Booking;
  }>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSchedule(formatDate(date));
      setData(result);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const onSlotClick = (room: Room, startTime: string) => {
    const endIdx = Math.min(timeToIndex(startTime) + 2, 24);
    setDrawerInitial({
      roomId: room.id,
      bookingDate: formatDate(date),
      startTime,
      endTime: indexToTime(endIdx),
    });
    setDrawerOpen(true);
  };

  const onBookingClick = (booking: Booking) => {
    Modal.info({
      title: booking.title,
      content: (
        <div style={{ lineHeight: 2 }}>
          <div>预约人：{booking.userName}</div>
          <div>会议室：{booking.roomName}</div>
          <div>
            时间：{booking.bookingDate} {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
          </div>
        </div>
      ),
      okText: booking.userId === user?.id ? '关闭' : '知道了',
      ...(booking.userId === user?.id
        ? {
            footer: (_, { OkBtn }) => (
              <Space>
                <Button
                  danger
                  onClick={async () => {
                    Modal.destroyAll();
                    await cancelBooking(booking.id);
                    message.success('已取消预约');
                    load();
                  }}
                >
                  取消预约
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    Modal.destroyAll();
                    setDrawerInitial({ booking });
                    setDrawerOpen(true);
                  }}
                >
                  修改
                </Button>
                <OkBtn />
              </Space>
            ),
          }
        : {}),
    });
  };

  const activeBookings = data?.bookings.filter((b) => b.status === 'ACTIVE').length || 0;
  const freeRooms = (data?.rooms.length || 0) - new Set(data?.bookings.map((b) => b.roomId)).size;

  return (
    <div>
      <PageHeader
        title="日程视图"
        subtitle={`${formatDate(date)} · 08:00 - 20:00`}
        extra={
          <>
            <div className="toolbar-group">
              <Button icon={<LeftOutlined />} onClick={() => setDate((d) => d.subtract(1, 'day'))} />
              <Button onClick={() => setDate(dayjs())}>今天</Button>
              <DatePicker value={date} onChange={(d) => d && setDate(d)} allowClear={false} />
              <Button icon={<RightOutlined />} onClick={() => setDate((d) => d.add(1, 'day'))} />
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              onClick={() => {
                setDrawerInitial({ bookingDate: formatDate(date) });
                setDrawerOpen(true);
              }}
            >
              新建预约
            </Button>
          </>
        }
      />

      <div className="stat-bar">
        <div className="stat-card">
          <div className="stat-card-value">{data?.rooms.length || 0}</div>
          <div className="stat-card-label">间会议室</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{activeBookings}</div>
          <div className="stat-card-label">今日预约</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{Math.max(freeRooms, 0)}</div>
          <div className="stat-card-label">当前有空闲</div>
        </div>
      </div>

      <div className="content-card">
        {loading ? (
          <div className="content-card-body">
            <Skeleton active paragraph={{ rows: 8 }} />
          </div>
        ) : isMobile ? (
          <MobileScheduleList
            rooms={data?.rooms || []}
            bookings={data?.bookings || []}
            currentUserId={user?.id}
            onSlotClick={onSlotClick}
            onBookingClick={onBookingClick}
            onBookRoom={(room) => {
              setDrawerInitial({ roomId: room.id, bookingDate: formatDate(date) });
              setDrawerOpen(true);
            }}
          />
        ) : (
          <ScheduleGrid
            rooms={data?.rooms || []}
            bookings={data?.bookings || []}
            currentUserId={user?.id}
            date={formatDate(date)}
            onSlotClick={onSlotClick}
            onBookingClick={onBookingClick}
          />
        )}
      </div>

      <BookingDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={load}
        initial={drawerInitial}
      />
    </div>
  );
}

export default SchedulePage;
