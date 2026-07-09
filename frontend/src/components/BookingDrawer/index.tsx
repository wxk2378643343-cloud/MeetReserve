import React, { useEffect, useState } from 'react';
import { Drawer, Modal, Form, DatePicker, Select, Input, Button, Radio, Empty, Spin, Tag } from 'antd';
import dayjs from 'dayjs';
import type { Booking, Room } from '@/types';
import { createBooking, recommendRooms, updateBooking } from '@/api/booking';
import { TIME_SLOTS, indexToTime, timeToIndex } from '@/utils/time';
import { message } from '@/utils/message';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: 'drawer' | 'modal';
  initial?: {
    roomId?: number;
    bookingDate?: string;
    startTime?: string;
    endTime?: string;
    booking?: Booking;
  };
}

function BookingFormDialog({ open, onClose, onSuccess, initial, mode = 'drawer' }: Props) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [recommend, setRecommend] = useState<{ available: boolean; rooms: Room[]; message: string | null }>({
    available: false,
    rooms: [],
    message: null,
  });
  const isEdit = !!initial?.booking;

  const loadRecommend = async () => {
    const date = form.getFieldValue('bookingDate');
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    if (!date || !startTime || !endTime) return;
    if (timeToIndex(endTime) <= timeToIndex(startTime)) return;

    setRecommendLoading(true);
    try {
      const result = await recommendRooms({
        date: dayjs(date).format('YYYY-MM-DD'),
        startTime,
        endTime,
        excludeBookingId: initial?.booking?.id,
      });
      setRecommend(result);
      if (result.available && result.rooms.length > 0) {
        const preferred = initial?.roomId
          ? result.rooms.find((r) => r.id === initial.roomId)?.id || result.rooms[0].id
          : result.rooms[0].id;
        form.setFieldValue('roomId', preferred);
      } else {
        form.setFieldValue('roomId', undefined);
      }
    } finally {
      setRecommendLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const booking = initial?.booking;
    form.setFieldsValue({
      bookingDate: booking?.bookingDate ? dayjs(booking.bookingDate) : dayjs(initial?.bookingDate || undefined),
      startTime: booking?.startTime?.slice(0, 5) || initial?.startTime || '09:00',
      endTime: booking?.endTime?.slice(0, 5) || initial?.endTime || '10:00',
      title: booking?.title || '',
      roomId: booking?.roomId || initial?.roomId,
    });
    setTimeout(loadRecommend, 0);
  }, [open, initial]);

  const onValuesChange = (changed: Record<string, unknown>) => {
    if ('startTime' in changed || 'endTime' in changed || 'bookingDate' in changed) {
      const start = form.getFieldValue('startTime');
      const end = form.getFieldValue('endTime');
      if (start && end && timeToIndex(end) <= timeToIndex(start)) {
        form.setFieldValue('endTime', indexToTime(timeToIndex(start) + 1));
      }
      loadRecommend();
    }
  };

  const submit = async () => {
    const values = await form.validateFields();
    if (!recommend.available) {
      message.warning(recommend.message || '暂时没有空闲会议室，请修改其他时间');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        roomId: values.roomId,
        bookingDate: dayjs(values.bookingDate).format('YYYY-MM-DD'),
        startTime: values.startTime,
        endTime: values.endTime,
        title: values.title,
      };
      if (isEdit && initial?.booking) {
        await updateBooking(initial.booking.id, payload);
        message.success('修改成功');
      } else {
        await createBooking(payload);
        message.success('预约成功');
      }
      onSuccess();
      onClose();
    } catch (e: unknown) {
      const err = e as { data?: typeof recommend };
      if (err.data?.rooms) {
        setRecommend(err.data as typeof recommend);
      }
    } finally {
      setLoading(false);
    }
  };

  const endOptions = TIME_SLOTS.filter((t) => {
    const start = form.getFieldValue('startTime');
    return !start || timeToIndex(t) > timeToIndex(start);
  });

  const footer = (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <Button onClick={onClose}>取消</Button>
      <Button type="primary" loading={loading} disabled={!recommend.available} onClick={submit}>
        {isEdit ? '保存修改' : '确认预约'}
      </Button>
    </div>
  );

  const formContent = (
    <Form form={form} layout="vertical" onValuesChange={onValuesChange}>
      <Form.Item name="bookingDate" label="日期" rules={[{ required: true }]}>
        <DatePicker style={{ width: '100%' }} disabledDate={(d) => d && d < dayjs().startOf('day')} />
      </Form.Item>
      <Form.Item label="时段" required>
        <div style={{ display: 'flex', gap: 8 }}>
          <Form.Item name="startTime" noStyle rules={[{ required: true }]}>
            <Select style={{ flex: 1 }} options={TIME_SLOTS.slice(0, -1).map((t) => ({ label: t, value: t }))} />
          </Form.Item>
          <span style={{ lineHeight: '32px' }}>-</span>
          <Form.Item name="endTime" noStyle rules={[{ required: true }]}>
            <Select style={{ flex: 1 }} options={endOptions.map((t) => ({ label: t, value: t }))} />
          </Form.Item>
        </div>
      </Form.Item>

      <div className="booking-recommend-box">
        <div style={{ fontWeight: 600, marginBottom: 8 }}>💡 推荐会议室</div>
        <Spin spinning={recommendLoading}>
          {recommend.available ? (
            <Form.Item name="roomId" rules={[{ required: true, message: '请选择会议室' }]} noStyle>
              <Radio.Group style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recommend.rooms.map((room) => (
                  <Radio key={room.id} value={room.id}>
                    {room.name}{' '}
                    <Tag color="orange">推荐</Tag>
                    <span style={{ color: '#64748b', fontSize: 12 }}>
                      👥{room.capacity} {room.location}
                    </span>
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          ) : (
            <Empty
              description={recommend.message || '暂时没有空闲会议室，请修改其他时间'}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Spin>
      </div>

      <Form.Item name="title" label="会议主题" rules={[{ required: true, message: '请输入会议主题' }]}>
        <Input placeholder="请输入会议主题" maxLength={200} />
      </Form.Item>
    </Form>
  );

  if (mode === 'modal') {
    return (
      <Modal
        title={isEdit ? '修改预约' : '新建预约'}
        open={open}
        onCancel={onClose}
        footer={footer}
        width={480}
        destroyOnClose
        className="booking-modal"
      >
        {formContent}
      </Modal>
    );
  }

  return (
    <Drawer title={isEdit ? '修改预约' : '新建预约'} open={open} onClose={onClose} width={400} footer={footer}>
      {formContent}
    </Drawer>
  );
}

export default BookingFormDialog;
