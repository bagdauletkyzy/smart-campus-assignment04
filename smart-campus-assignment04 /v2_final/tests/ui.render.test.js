// UI behaviour via the presentation layer (service state -> HTML). No browser needed.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../src/app/service.js';
import { ROOMS, NOW } from '../src/data/rooms.js';
import { renderRoomList, renderResult, renderBookings, escapeHtml, EMPTY_MESSAGE } from '../src/ui/render.js';
import { req } from './helpers.js';

test('F4 UI shows a clear empty state when no rooms match', () => {
  const s = createService({ rooms: ROOMS, now: NOW });
  const st = s.setFilters({ attendees: 100, equipment: ['projector'] });
  const html = renderRoomList(st.visibleRooms, null);
  assert.ok(html.includes(EMPTY_MESSAGE));
  assert.ok(html.includes('role="status"'));
  assert.ok(!html.includes('type="radio"'));
});

test('UI lists only matching rooms and marks blocked rooms', () => {
  const s = createService({ rooms: ROOMS, now: NOW });
  const html = renderRoomList(s.setFilters({ attendees: 25, equipment: ['computers'] }).visibleRooms, null);
  assert.ok(html.includes('Computer Lab Delta') && html.includes('Blocked'));
  assert.ok(!html.includes('Focus Pod Alpha'));
});

test('F5 UI result refreshes: verdict shown, then placeholder after switching rooms', () => {
  const s = createService({ rooms: ROOMS, now: NOW });
  s.selectRoom('R101');
  const shown = renderResult(s.check(req('10:00', '11:00')).result);
  assert.ok(shown.includes('Unavailable') && shown.includes('verdict bad'));
  const cleared = renderResult(s.selectRoom('R102').result);
  assert.ok(!cleared.includes('Unavailable'));
  assert.ok(cleared.includes('placeholder'));
});

test('UI available verdict uses the success style', () => {
  const s = createService({ rooms: ROOMS, now: NOW });
  s.selectRoom('R101');
  assert.ok(renderResult(s.check(req('12:00', '13:00')).result).includes('verdict ok'));
});

test('UI highlights only the conflicting booking (shared overlap rule)', () => {
  const room = ROOMS.find((r) => r.id === 'R101');
  const html = renderBookings(room, req('10:30', '11:30'));
  assert.equal((html.match(/class="conflict"/g) || []).length, 1);
});

test('UI output is HTML-escaped', () => {
  assert.equal(escapeHtml('<b>"x"</b>'), '&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
});
