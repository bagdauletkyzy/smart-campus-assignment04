// Integration: filters -> select room -> check availability -> switch rooms (F4, F5, per-room data).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../src/app/service.js';
import { ROOMS, NOW } from '../src/data/rooms.js';
import { req } from './helpers.js';

const fresh = () => createService({ rooms: ROOMS, now: NOW });

test('availability uses the CHOSEN room bookings (same slot, two rooms)', () => {
  const s = fresh();
  s.selectRoom('R101');                                  // booked 10:00-11:00
  assert.equal(s.check(req('10:00', '11:00')).result.available, false);
  s.selectRoom('R105');                                  // free 10:00-11:00 (booked 11:00-12:00)
  assert.equal(s.check(req('10:00', '11:00')).result.available, true);
});

test('F5 switching the room clears the previous result (no stale answer)', () => {
  const s = fresh();
  s.selectRoom('R101');
  assert.equal(s.check(req('10:00', '11:00')).result.label, 'Unavailable');
  assert.equal(s.selectRoom('R105').result, null);
});

test('F5 re-selecting the same room keeps its result', () => {
  const s = fresh();
  s.selectRoom('R101');
  s.check(req('12:00', '13:00'));
  assert.equal(s.selectRoom('R101').result.label, 'Available');
});

test('F4 no rooms match -> empty visible list', () => {
  const s = fresh();
  const st = s.setFilters({ attendees: 100, equipment: [] });
  assert.deepEqual(st.visibleRooms, []);
});

test('changing filters drops a selected room that no longer matches, and its result', () => {
  const s = fresh();
  s.selectRoom('R101');                                  // capacity 4
  s.check(req('12:00', '13:00'));
  const st = s.setFilters({ attendees: 10, equipment: [] });
  assert.equal(st.selectedRoom, null);
  assert.equal(st.result, null);
});

test('a room hidden by the filters cannot be selected', () => {
  const s = fresh();
  s.setFilters({ attendees: 50, equipment: [] });
  assert.equal(s.selectRoom('R101').selectedRoom, null);
});

test('checking without a selected room gives a clear message', () => {
  const r = fresh().check(req('12:00', '13:00')).result;
  assert.equal(r.available, false);
  assert.equal(r.code, 'NO_ROOM');
});

test('full flow: filter -> select -> unsuccessful -> switch -> successful', () => {
  const s = fresh();
  const st = s.setFilters({ attendees: 15, equipment: ['projector'] });
  assert.deepEqual(st.visibleRooms.map((r) => r.id), ['R102', 'R103', 'R104']);
  s.selectRoom('R102');
  assert.equal(s.check(req('10:30', '11:30')).result.code, 'OVERLAP');
  s.selectRoom('R103');
  assert.equal(s.check(req('10:30', '11:30')).result.available, true);  // touches 10:30 end
  s.selectRoom('R104');
  assert.equal(s.check(req('10:30', '11:30')).result.code, 'BLOCKED');
});

test('service never mutates the frozen catalog', () => {
  const before = JSON.stringify(ROOMS);
  const s = fresh();
  s.setFilters({ attendees: 5, equipment: ['whiteboard'] });
  s.selectRoom('R102');
  s.check(req('12:00', '13:00'));
  assert.equal(JSON.stringify(ROOMS), before);
});
