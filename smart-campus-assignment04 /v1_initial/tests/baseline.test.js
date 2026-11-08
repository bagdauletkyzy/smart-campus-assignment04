'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { checkAvailability, ROOM } = require('../app.js');

const NOW = '2026-11-10T09:00';
const D = '2026-11-10';
const fresh = (over = {}) => ({
  id: 'T1', name: 'Test', blocked: false,
  bookings: [{ date: D, start: '10:00', end: '11:00' }],
  ...over
});

test('AC1 rejects start equal to or after end', () => {
  assert.equal(checkAvailability(D, '12:00', '12:00', NOW, fresh()).available, false);
  assert.equal(checkAvailability(D, '13:00', '12:00', NOW, fresh()).available, false);
});
test('AC1 rejects a request in the past', () => {
  assert.equal(checkAvailability(D, '08:00', '08:30', NOW, fresh()).available, false);
});
test('AC2 accepts exactly 120 minutes', () => {
  assert.equal(checkAvailability(D, '12:00', '14:00', NOW, fresh()).available, true);
});
test('AC2 rejects 121 minutes', () => {
  assert.equal(checkAvailability(D, '12:00', '14:01', NOW, fresh()).available, false);
});
test('AC3 rejects a blocked room', () => {
  assert.equal(checkAvailability(D, '12:00', '13:00', NOW, fresh({ blocked: true })).available, false);
});
test('AC4 rejects an overlapping request', () => {
  assert.equal(checkAvailability(D, '10:30', '11:30', NOW, fresh()).available, false);
});
test('AC4 allows requests that only touch booking endpoints', () => {
  assert.equal(checkAvailability(D, '11:00', '12:00', NOW, fresh()).available, true);
  assert.equal(checkAvailability(D, '09:00', '10:00', NOW, fresh()).available, true);
});
test('AC5 returns Available/Unavailable without mutating booking data', () => {
  const room = fresh({ bookings: [
    { date: D, start: '14:00', end: '15:00' },
    { date: D, start: '10:00', end: '11:00' }
  ] });
  const snapshot = JSON.stringify(room);
  const ok = checkAvailability(D, '12:00', '13:00', NOW, room);
  const bad = checkAvailability(D, '10:30', '11:30', NOW, room);
  assert.match(ok.message, /^Available/);
  assert.match(bad.message, /^Unavailable/);
  assert.equal(JSON.stringify(room), snapshot);
});
test('default fixture room is a real room object (sanity)', () => {
  assert.equal(ROOM.id, 'R101');
});
