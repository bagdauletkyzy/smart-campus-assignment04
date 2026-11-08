// RECONSTRUCTED BASELINE (v1) - single room, typical "monolith" prototype.
// Validation, overlap logic and DOM rendering live in one file and some rules
// are intentionally duplicated (this is the state a quick prototype is usually in).
'use strict';

var NOW = '2026-11-10T09:00';          // fixed "current time"
var MAX_MINUTES = 120;

var ROOM = {
  id: 'R101',
  name: 'Focus Pod Alpha',
  blocked: false,
  bookings: [
    { date: '2026-11-10', start: '10:00', end: '11:00' },
    { date: '2026-11-10', start: '14:00', end: '15:00' }
  ]
};

function toStamp(date, time) {
  return Date.parse(date + 'T' + time + ':00Z');
}

// Core rule check: AC1-AC5
function checkAvailability(date, start, end, now, room) {
  now = now || NOW;
  room = room || ROOM;
  var s = toStamp(date, start);
  var e = toStamp(date, end);
  if (isNaN(s) || isNaN(e)) {
    return { available: false, message: 'Unavailable: enter a valid date and time.' };
  }
  if (s >= e) {
    return { available: false, message: 'Unavailable: end time must be after start time.' };
  }
  if (s < Date.parse(now + ':00Z')) {
    return { available: false, message: 'Unavailable: start time is in the past.' };
  }
  if ((e - s) / 60000 > MAX_MINUTES) {
    return { available: false, message: 'Unavailable: maximum booking is 120 minutes.' };
  }
  if (room.blocked) {
    return { available: false, message: 'Unavailable: room is blocked.' };
  }
  for (var i = 0; i < room.bookings.length; i++) {
    var b = room.bookings[i];
    var bs = Date.parse(b.date + 'T' + b.start + ':00Z');
    var be = Date.parse(b.date + 'T' + b.end + ':00Z');
    if (s < be && e > bs) {
      return { available: false, message: 'Unavailable: overlaps booking ' + b.start + '-' + b.end + '.' };
    }
  }
  return { available: true, message: 'Available' };
}

// ---------------- UI (browser only) ----------------
function renderBookings(date, start, end) {
  var list = document.getElementById('bookings');
  list.innerHTML = '';
  var s = Date.parse(date + 'T' + start + ':00Z');
  var e = Date.parse(date + 'T' + end + ':00Z');
  for (var i = 0; i < ROOM.bookings.length; i++) {
    var b = ROOM.bookings[i];
    var li = document.createElement('li');
    li.textContent = b.date + ' ' + b.start + '-' + b.end;
    var bs = Date.parse(b.date + 'T' + b.start + ':00Z');
    var be = Date.parse(b.date + 'T' + b.end + ':00Z');
    if (s < be && e > bs) {          // duplicated overlap formula
      li.className = 'conflict';
    }
    list.appendChild(li);
  }
}

function liveValidate() {
  var date = document.getElementById('date').value;
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;
  var box = document.getElementById('result');
  var s = Date.parse(date + 'T' + start + ':00Z');
  var e = Date.parse(date + 'T' + end + ':00Z');
  if (s >= e) {                       // duplicated start<end rule
    box.className = 'hint';
    box.textContent = 'Hint: end time must be after start time.';
  } else if ((e - s) / 60000 > 120) { // duplicated max-duration rule
    box.className = 'hint';
    box.textContent = 'Hint: maximum booking is 120 minutes.';
  } else {
    box.className = '';
    box.textContent = '';
  }
  renderBookings(date, start, end);
}

function onCheck() {
  var date = document.getElementById('date').value;
  var start = document.getElementById('start').value;
  var end = document.getElementById('end').value;
  var box = document.getElementById('result');
  var res = checkAvailability(date, start, end);
  if (res.available) {                // duplicated result rendering
    box.className = 'ok';
    box.textContent = res.message;
  } else {
    box.className = 'error';
    box.textContent = res.message;
  }
  renderBookings(date, start, end);
}

if (typeof document !== 'undefined') {
  document.getElementById('room-name').textContent = ROOM.name;
  ['date', 'start', 'end'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', liveValidate);
  });
  document.getElementById('check').addEventListener('click', onCheck);
  liveValidate();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { checkAvailability: checkAvailability, ROOM: ROOM, NOW: NOW };
}
