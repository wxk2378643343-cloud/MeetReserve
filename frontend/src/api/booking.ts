import request from '@/utils/request';
import type { Booking, PageResult, RecommendResult, ScheduleData } from '@/types';

export function getSchedule(date: string) {
  return request.get<any, ScheduleData>('/schedule', { params: { date } });
}

export function getMyBookings(params: { page?: number; size?: number; status?: string }) {
  return request.get<any, PageResult<Booking>>('/bookings/my', { params });
}

export function createBooking(data: {
  roomId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  title: string;
}) {
  return request.post<any, Booking>('/bookings', data);
}

export function updateBooking(
  id: number,
  data: Partial<{
    roomId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    title: string;
  }>
) {
  return request.put<any, Booking>(`/bookings/${id}`, data);
}

export function cancelBooking(id: number) {
  return request.delete(`/bookings/${id}`);
}

export function recommendRooms(params: {
  date: string;
  startTime: string;
  endTime: string;
  excludeBookingId?: number;
}) {
  return request.get<any, RecommendResult>('/rooms/recommend', { params });
}
