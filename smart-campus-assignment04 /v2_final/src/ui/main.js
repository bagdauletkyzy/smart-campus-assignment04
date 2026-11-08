// Browser wiring: DOM events -> service -> render. No business rules here.
import { ROOMS, NOW, EQUIPMENT } from '../data/rooms.js';
import { createService } from '../app/service.js';
import { renderEquipment, renderRoomList, renderResult, renderBookings } from './render.js';

const service = createService({ rooms: ROOMS, now: NOW });
const $ = (id) => document.getElementById(id);

const readRequest = () => ({ date: $('date').value, start: $('start').value, end: $('end').value });
const readFilters = () => ({
  attendees: $('attendees').value,
  equipment: [...document.querySelectorAll('input[name="equipment"]:checked')].map((i) => i.value)
});

function draw(state, { refocusRoom = false } = {}) {
  $('rooms').innerHTML = renderRoomList(state.visibleRooms, state.selectedRoom?.id);
  $('result').innerHTML = renderResult(state.result);
  $('bookings').innerHTML = renderBookings(state.selectedRoom, state.result ? readRequest() : null);
  $('count').textContent = `${state.visibleRooms.length} of ${ROOMS.length} rooms match`;
  if (refocusRoom) $('rooms').querySelector('input:checked')?.focus();
}

$('equipment').innerHTML = renderEquipment(EQUIPMENT, []);
$('now').textContent = '10 Nov 2026, 09:00';

$('filters').addEventListener('input', () => draw(service.setFilters(readFilters())));
$('rooms').addEventListener('change', (e) => {
  if (e.target.name === 'room') draw(service.selectRoom(e.target.value), { refocusRoom: true });
});
$('check').addEventListener('click', () => draw(service.check(readRequest())));

draw(service.getState());
