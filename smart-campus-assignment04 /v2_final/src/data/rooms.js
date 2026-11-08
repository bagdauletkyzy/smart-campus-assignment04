// Room catalog: DATA ONLY (fictional). No logic lives here.
export const NOW = '2026-11-10T09:00'; // fixed "current time" for the whole app

export const EQUIPMENT = Object.freeze([
  'projector', 'whiteboard', 'microphone', 'video-conferencing', 'computers'
]);

const deepFreeze = (o) => {
  Object.values(o).forEach((v) => { if (v && typeof v === 'object') deepFreeze(v); });
  return Object.freeze(o);
};

// Frozen on purpose: any accidental sort/push/splice on booking data throws (AC5).
export const ROOMS = deepFreeze([
  { id: 'R101', name: 'Focus Pod Alpha', capacity: 4, equipment: ['whiteboard'], blocked: false,
    bookings: [{ date: '2026-11-10', start: '10:00', end: '11:00' },
               { date: '2026-11-10', start: '14:00', end: '15:00' }] },
  { id: 'R102', name: 'Seminar Room Beta', capacity: 20, equipment: ['projector', 'whiteboard'], blocked: false,
    bookings: [{ date: '2026-11-10', start: '10:00', end: '11:30' },
               { date: '2026-11-10', start: '13:00', end: '14:00' }] },
  { id: 'R103', name: 'Lecture Hall Gamma', capacity: 60,
    equipment: ['projector', 'microphone', 'whiteboard', 'video-conferencing'], blocked: false,
    bookings: [{ date: '2026-11-10', start: '09:30', end: '10:30' },
               { date: '2026-11-10', start: '12:00', end: '13:00' }] },
  { id: 'R104', name: 'Computer Lab Delta', capacity: 30, equipment: ['computers', 'projector'], blocked: true,
    bookings: [] },
  { id: 'R105', name: 'Workshop Studio Epsilon', capacity: 12, equipment: ['whiteboard', 'video-conferencing'], blocked: false,
    bookings: [{ date: '2026-11-10', start: '11:00', end: '12:00' },
               { date: '2026-11-11', start: '09:00', end: '10:00' }] }
]);
