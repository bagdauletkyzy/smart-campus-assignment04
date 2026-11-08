// Shared fixtures: fresh objects per call, fixed clock (never the real time).
export const NOW = '2026-11-10T09:00';
export const D = '2026-11-10';

export const makeRoom = (over = {}) => ({
  id: 'T1', name: 'Test room', capacity: 10, equipment: ['projector'], blocked: false,
  bookings: [{ date: D, start: '10:00', end: '11:00' }],
  ...over
});

export const req = (start, end, date = D) => ({ date, start, end });

export const deepFreeze = (o) => {
  Object.values(o).forEach((v) => { if (v && typeof v === 'object') deepFreeze(v); });
  return Object.freeze(o);
};
