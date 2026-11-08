// Availability rules (AC1-AC5). Pure functions: no DOM, no mutation, "now" is injected.
export const MAX_MINUTES = 120;
const MS_PER_MINUTE = 60000;

export function toTimestamp(date, time) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? '') || !/^\d{2}:\d{2}$/.test(time ?? '')) return NaN;
  return Date.parse(`${date}T${time}:00Z`);
}

export const parseNow = (now) => Date.parse(`${now}:00Z`);

// Half-open intervals: touching endpoints do NOT overlap (AC4).
export const overlaps = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && aEnd > bStart;

export const bookingRange = (b) => [toTimestamp(b.date, b.start), toTimestamp(b.date, b.end)];

const fail = (code, message) => ({ ok: false, code, message });

// AC1 + AC2 in ONE place (previously duplicated in the UI and the core check).
export function validateRequest({ date, start, end }, now) {
  const s = toTimestamp(date, start);
  const e = toTimestamp(date, end);
  if (Number.isNaN(s) || Number.isNaN(e)) return fail('INVALID_INPUT', 'Enter a valid date, start time and end time.');
  if (s >= e) return fail('END_BEFORE_START', 'End time must be after start time.');
  if (s < parseNow(now)) return fail('IN_THE_PAST', 'Start time is in the past.');
  if ((e - s) / MS_PER_MINUTE > MAX_MINUTES) return fail('TOO_LONG', `Maximum booking is ${MAX_MINUTES} minutes.`);
  return { ok: true, startMs: s, endMs: e };
}

// Returns bookings that clash with the request (non-mutating; used by rules AND the UI highlight).
export function findConflicts(room, request) {
  const s = toTimestamp(request.date, request.start);
  const e = toTimestamp(request.date, request.end);
  if (Number.isNaN(s) || Number.isNaN(e)) return [];
  return room.bookings.filter((b) => {
    const [bs, be] = bookingRange(b);
    return overlaps(s, e, bs, be);
  });
}

const result = (room, available, code, message) => ({
  roomId: room ? room.id : null,
  available,
  label: available ? 'Available' : 'Unavailable',
  code,
  message
});

export function checkAvailability(room, request, now) {
  if (!room) return result(null, false, 'NO_ROOM', 'Select a room first.');
  const v = validateRequest(request, now);
  if (!v.ok) return result(room, false, v.code, v.message);
  if (room.blocked) return result(room, false, 'BLOCKED', 'This room is blocked.');
  const [first] = findConflicts(room, request);
  if (first) return result(room, false, 'OVERLAP', `Overlaps an existing booking (${first.start}-${first.end}).`);
  return result(room, true, 'OK', 'The room is free for the requested time.');
}
