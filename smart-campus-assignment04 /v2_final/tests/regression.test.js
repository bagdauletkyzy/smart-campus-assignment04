// Original acceptance criteria AC1-AC5 (same cases as v1 baseline) + boundaries.
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkAvailability } from '../src/domain/availability.js';
import { NOW, makeRoom, req, deepFreeze, D } from './helpers.js';

const check = (room, r) => checkAvailability(room, r, NOW);

test('AC1 rejects start equal to or after end', () => {
  assert.equal(check(makeRoom(), req('12:00', '12:00')).available, false);
  const reversed = check(makeRoom(), req('13:00', '12:00'));
  assert.equal(reversed.available, false);
  assert.equal(reversed.code, 'END_BEFORE_START');
});

test('AC1 rejects a request in the past', () => {
  const r = check(makeRoom(), req('08:00', '08:30'));
  assert.equal(r.available, false);
  assert.equal(r.code, 'IN_THE_PAST');
});

test('AC1 request starting exactly at "now" is not in the past', () => {
  assert.equal(check(makeRoom({ bookings: [] }), req('09:00', '09:30')).available, true);
});

test('AC1 rejects missing or malformed input', () => {
  assert.equal(check(makeRoom(), { date: '', start: '', end: '' }).code, 'INVALID_INPUT');
  assert.equal(check(makeRoom(), req('25:00', '26:00')).available, false);
});

test('AC2 boundary: exactly 120 minutes is accepted', () => {
  assert.equal(check(makeRoom(), req('12:00', '14:00')).available, true);
});

test('AC2 boundary: 121 minutes is rejected', () => {
  const r = check(makeRoom(), req('12:00', '14:01'));
  assert.equal(r.available, false);
  assert.equal(r.code, 'TOO_LONG');
});

test('AC3 rejects a blocked room even when the time is free', () => {
  const r = check(makeRoom({ blocked: true, bookings: [] }), req('12:00', '13:00'));
  assert.equal(r.available, false);
  assert.equal(r.code, 'BLOCKED');
});

test('AC4 rejects an overlapping request (partial overlap)', () => {
  const r = check(makeRoom(), req('10:30', '11:30'));
  assert.equal(r.available, false);
  assert.equal(r.code, 'OVERLAP');
});

test('AC4 rejects a request fully inside / fully covering a booking', () => {
  assert.equal(check(makeRoom(), req('10:15', '10:45')).available, false);
  assert.equal(check(makeRoom(), req('09:30', '11:30')).available, false);
});

test('AC4 boundary: touching at the end of a booking is allowed', () => {
  assert.equal(check(makeRoom(), req('11:00', '12:00')).available, true);
});

test('AC4 boundary: touching at the start of a booking is allowed', () => {
  assert.equal(check(makeRoom(), req('09:00', '10:00')).available, true);
});

test('AC4 a booking on another date does not conflict', () => {
  assert.equal(check(makeRoom(), req('10:00', '11:00', '2026-11-11')).available, true);
});

test('AC5 returns Available / Unavailable labels', () => {
  assert.equal(check(makeRoom(), req('12:00', '13:00')).label, 'Available');
  assert.equal(check(makeRoom(), req('10:30', '11:30')).label, 'Unavailable');
});

test('AC5 does not mutate booking data (frozen room + snapshot, unsorted input)', () => {
  const room = deepFreeze(makeRoom({ bookings: [
    { date: D, start: '14:00', end: '15:00' },
    { date: D, start: '10:00', end: '11:00' }
  ] }));
  const before = JSON.stringify(room);
  assert.doesNotThrow(() => {            // a sort/push/splice on frozen data would throw
    check(room, req('12:00', '13:00'));
    check(room, req('10:30', '11:30'));
  });
  assert.equal(JSON.stringify(room), before);
});
