import dayjs from 'dayjs';

export const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let h = 8; h < 20; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
})();

export function timeToIndex(time: string, start = '08:00', slotMinutes = 30): number {
  const [sh, sm] = start.split(':').map(Number);
  const [h, m] = time.split(':').map(Number);
  return ((h - sh) * 60 + (m - sm)) / slotMinutes;
}

export function indexToTime(index: number, start = '08:00', slotMinutes = 30): string {
  const [sh, sm] = start.split(':').map(Number);
  const total = sh * 60 + sm + index * slotMinutes;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDate(d?: dayjs.Dayjs) {
  return (d || dayjs()).format('YYYY-MM-DD');
}

export function slotCount(start: string, end: string, slotMinutes = 30): number {
  return timeToIndex(end, '08:00', slotMinutes) - timeToIndex(start, '08:00', slotMinutes);
}
