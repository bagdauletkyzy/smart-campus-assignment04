// Room filtering (F1, F2). Pure; never mutates the catalog.
export function normalizeAttendees(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export function filterRooms(rooms, { attendees = 1, equipment = [] } = {}) {
  const need = normalizeAttendees(attendees);
  return rooms.filter(
    (room) =>
      room.capacity >= need &&                                  // F1
      equipment.every((item) => room.equipment.includes(item))  // F2 (ALL items)
  );
}
