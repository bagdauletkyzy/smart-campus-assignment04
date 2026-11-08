# Smart Campus - Room Availability (Assignment #04)

Fictional Smart Campus prototype: a room catalog (5 rooms) with capacity/equipment filters and an availability checker.

```
v1_initial/   RECONSTRUCTED baseline: one room, monolith (app.js), 9 tests
v2_final/     final version: catalog + filters + modular code, 37 tests
evidence/     real test outputs, duplication + mutation checks, browser smoke test, screenshots
diagrams/     before.svg / after.svg (+ .png)
REPORT.md  AI_EVIDENCE.md  REFLECTION.md  SUBMISSION_EMAIL.txt
```
Git history: `git log --oneline` (commit 1 = v1 baseline, commit 2 = v2 final, commit 3 = documentation).

## Requirements
Node.js 18 or newer (tested with v22). No npm packages to install.

## Run the tests
```
cd v1_initial && npm test      # baseline: AC1-AC5, 9 tests
cd ../v2_final && npm test     # final: 37 tests (node --test --test-reporter=spec)
```

## Run the app
v1 (classic script): open `v1_initial/index.html` in a browser.

v2 (ES modules need a web server, double-clicking index.html will NOT work):
```
cd v2_final
npm start                      # then open http://localhost:8080
```

## Optional browser smoke test (needs Python + Playwright + Chromium)
```
(cd v2_final && npm start) &   # keep the server running
python3 evidence/ui_smoke.py   # run from the project root
```

## Fixed assumptions
"Now" is fixed to 2026-11-10 09:00 (UTC-style naive time) in `v2_final/src/data/rooms.js`. All data is fictional. Blocked rooms stay in the list (tagged "Blocked") when they pass the capacity/equipment filters, and report Unavailable (AC3/F3).
