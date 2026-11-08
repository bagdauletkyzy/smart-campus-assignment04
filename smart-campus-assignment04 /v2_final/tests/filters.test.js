// New requirements F1-F3 (+ data integrity of the real catalog).
import test from 'node:test';
import assert from 'node:assert/strict';
import { filterRooms } from '../src/domain/filters.js';
import { checkAvailability } from '../src/domain/availability.js';
import { ROOMS } from '../src/data/rooms.js';
import { NOW, makeRoom, req } from './helpers.js';

const ids = (rooms) => rooms.map((r) => r.id);

test('catalog has at least 4 rooms with id, name, capacity, equipment, blocked, bookings', () => {
  assert.ok(ROOMS.length >= 4);
  for (const r of ROOMS) {
    assert.ok(r.id && r.name && Number.isInteger(r.capacity));
    assert.ok(Array.isArray(r.equipment) && Array.isArray(r.bookings));
    assert.equal(typeof r.blocked, 'boolean');
  }
  assert.ok(ROOMS.some((r) => r.blocked), 'at least one blocked room');
  assert.equal(new Set(ids(ROOMS)).size, ROOMS.length, 'unique ids');
});

test('F1 boundary: capacity exactly equal to attendees is included', () => {
  const rooms = [makeRoom({ id: 'A', capacity: 10 })];
  assert.deepEqual(ids(filterRooms(rooms, { attendees: 10 })), ['A']);
});

test('F1 boundary: capacity one below attendees is excluded', () => {
  const rooms = [makeRoom({ id: 'A', capacity: 10 })];
  assert.deepEqual(ids(filterRooms(rooms, { attendees: 11 })), []);
});

test('F1 on the real catalog: 21 attendees leaves only the 30- and 60-seat rooms', () => {
  assert.deepEqual(ids(filterRooms(ROOMS, { attendees: 21 })), ['R103', 'R104']);
});

test('F2 requires ALL selected equipment (AND, not OR)', () => {
  const rooms = [
    makeRoom({ id: 'P', equipment: ['projector'] }),
    makeRoom({ id: 'PW', equipment: ['projector', 'whiteboard'] })
  ];
  assert.deepEqual(ids(filterRooms(rooms, { equipment: ['projector', 'whiteboard'] })), ['PW']);
  assert.deepEqual(ids(filterRooms(rooms, { equipment: ['projector'] })), ['P', 'PW']);
});

test('F1+F2 combined on the real catalog', () => {
  assert.deepEqual(ids(filterRooms(ROOMS, { attendees: 10, equipment: ['video-conferencing', 'whiteboard'] })),
    ['R103', 'R105']);
});

test('filtering never mutates the catalog (frozen) and returns a new array', () => {
  const out = filterRooms(ROOMS, { attendees: 1 });
  assert.notEqual(out, ROOMS);
  assert.equal(ROOMS.length, 5);
});

test('F3 a blocked room is never reported as available', () => {
  const blocked = ROOMS.find((r) => r.id === 'R104');
  for (const [s, e] of [['10:00', '11:00'], ['12:00', '13:00'], ['15:00', '16:00']]) {
    assert.equal(checkAvailability(blocked, req(s, e), NOW).available, false);
  }
});
