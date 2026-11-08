// Presentation only: pure functions that turn state into HTML strings.
import { findConflicts } from '../domain/availability.js';

export const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const EMPTY_MESSAGE = 'No rooms match your requirements. Try fewer attendees or less equipment.';

export function renderEquipment(all, selected) {
  return all.map((item) => `
    <label class="chip">
      <input type="checkbox" name="equipment" value="${escapeHtml(item)}"${selected.includes(item) ? ' checked' : ''}>
      <span>${escapeHtml(item)}</span>
    </label>`).join('');
}

export function renderRoomList(rooms, selectedId) {
  if (rooms.length === 0) return `<p class="empty" role="status">${EMPTY_MESSAGE}</p>`;
  return rooms.map((r) => `
    <label class="room${r.id === selectedId ? ' is-selected' : ''}${r.blocked ? ' is-blocked' : ''}">
      <input type="radio" name="room" value="${escapeHtml(r.id)}"${r.id === selectedId ? ' checked' : ''}>
      <span class="room-name">${escapeHtml(r.name)}${r.blocked ? ' <em class="tag">Blocked</em>' : ''}</span>
      <span class="room-meta">${r.capacity} seats &middot; ${escapeHtml(r.equipment.join(', ') || 'no equipment')}</span>
    </label>`).join('');
}

export function renderResult(result) {
  if (!result) return '<p class="placeholder">Pick a room and a time, then check availability.</p>';
  const cls = result.available ? 'ok' : 'bad';
  return `<div class="verdict ${cls}"><strong>${escapeHtml(result.label)}</strong><span>${escapeHtml(result.message)}</span></div>`;
}

export function renderBookings(room, request) {
  if (!room) return '<p class="placeholder">Select a room to see its bookings.</p>';
  if (room.bookings.length === 0) return '<p class="placeholder">This room has no bookings.</p>';
  const conflicts = request ? findConflicts(room, request) : [];
  return `<ul>${room.bookings.map((b) =>
    `<li class="${conflicts.includes(b) ? 'conflict' : ''}">${escapeHtml(b.date)} ${escapeHtml(b.start)}-${escapeHtml(b.end)}</li>`
  ).join('')}</ul>`;
}
