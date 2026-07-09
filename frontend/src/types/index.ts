export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface User {
  id: number;
  username: string;
  realName: string;
  role: 'ADMIN' | 'USER';
  status?: number;
  createdAt?: string;
}

export interface Room {
  id: number;
  name: string;
  location?: string;
  capacity: number;
  equipment?: string;
  status?: number;
  description?: string;
}

export interface Booking {
  id: number;
  roomId: number;
  roomName?: string;
  userId: number;
  userName?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  title: string;
  status: 'ACTIVE' | 'CANCELLED';
}

export interface ScheduleData {
  date: string;
  timeRange: {
    start: string;
    end: string;
    slotMinutes: number;
  };
  rooms: Room[];
  bookings: Booking[];
}

export interface RecommendResult {
  available: boolean;
  rooms: Room[];
  message: string | null;
}

export interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; username: string; reason: string }[];
}

export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}
