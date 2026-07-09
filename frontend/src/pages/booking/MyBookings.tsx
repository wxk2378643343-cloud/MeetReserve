import { useEffect, useState } from 'react';
import { Card, Tag, Button, Space, Select, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getMyBookings, cancelBooking } from '@/api/booking';
import type { Booking } from '@/types';
import BookingFormDialog from '@/components/BookingDrawer';
import PageHeader from '@/components/PageHeader';
import { formatDate } from '@/utils/time';
import { message } from '@/utils/message';

function MyBookingsPage() {
  const [list, setList] = useState<Booking[]>([]);
  const [status, setStatus] = useState<string>('ACTIVE');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | undefined>();

  const load = async () => {
    const res = await getMyBookings({ page: 1, size: 100, status: status || undefined });
    setList(res.records);
  };

  useEffect(() => {
    load();
  }, [status]);

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (item: Booking) => {
    setEditing(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(undefined);
  };

  return (
    <div>
      <PageHeader
        title="我的预约"
        subtitle="查看和管理您的会议室预约记录"
        extra={
          <Space>
            <Select
              style={{ width: 140 }}
              value={status}
              onChange={setStatus}
              options={[
                { label: '进行中', value: 'ACTIVE' },
                { label: '已取消', value: 'CANCELLED' },
                { label: '全部', value: '' },
              ]}
            />
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreate}>
              新建预约
            </Button>
          </Space>
        }
      />

      {list.length === 0 ? (
        <div className="content-card">
          <div className="content-card-body">
            <Empty description="暂无预约">
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                新建预约
              </Button>
            </Empty>
          </div>
        </div>
      ) : (
        list.map((item) => (
          <Card key={item.id} className="booking-card" bodyStyle={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Space>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>{item.title}</span>
                  <Tag color={item.status === 'ACTIVE' ? '#E60012' : 'default'}>
                    {item.status === 'ACTIVE' ? '进行中' : '已取消'}
                  </Tag>
                </Space>
                <div style={{ color: '#8c8c8c', marginTop: 8, fontSize: 13 }}>
                  {item.roomName} · {item.bookingDate} {item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)}
                </div>
              </div>
              {item.status === 'ACTIVE' && (
                <Space>
                  <Button onClick={() => openEdit(item)}>修改</Button>
                  <Button
                    danger
                    onClick={async () => {
                      await cancelBooking(item.id);
                      message.success('已取消');
                      load();
                    }}
                  >
                    取消
                  </Button>
                </Space>
              )}
            </div>
          </Card>
        ))
      )}

      <BookingFormDialog
        mode="modal"
        open={modalOpen}
        onClose={closeModal}
        onSuccess={load}
        initial={
          editing
            ? { booking: editing }
            : { bookingDate: formatDate(dayjs()) }
        }
      />
    </div>
  );
}

export default MyBookingsPage;
