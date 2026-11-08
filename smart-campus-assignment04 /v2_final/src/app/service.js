// Application service: owns UI-independent state and orchestrates domain modules.
import { filterRooms, normalizeAttendees } from '../domain/filters.js';
import { checkAvailability } from '../domain/availability.js';

export function createService({ rooms, now }) {
  let filters = { attendees: 1, equipment: [] };
  let selectedRoomId = null;
  let result = null;

  const visibleRooms = () => filterRooms(rooms, filters);
  const findRoom = (id) => rooms.find((r) => r.id === id) ?? null;

  const getState = () => ({
    now,
    filters: { attendees: filters.attendees, equipment: [...filters.equipment] },
    visibleRooms: visibleRooms(),
    selectedRoom: findRoom(selectedRoomId),
    result
  });

  return {
    getState,

    setFilters(next) {
      filters = {
        attendees: normalizeAttendees(next.attendees),
        equipment: [...(next.equipment ?? [])]
      };
      // A selected room that no longer matches must be dropped, with its result.
      if (!visibleRooms().some((r) => r.id === selectedRoomId)) {
        selectedRoomId = null;
        result = null;
      }
      return getState();
    },

    // F5: changing the room clears the previous availability result.
    selectRoom(id) {
      if (id === selectedRoomId) return getState();
      selectedRoomId = visibleRooms().some((r) => r.id === id) ? id : null;
      result = null;
      return getState();
    },

    // Uses ONLY the selected room's bookings.
    check(request) {
      result = checkAvailability(findRoom(selectedRoomId), request, now);
      return getState();
    }
  };
}
