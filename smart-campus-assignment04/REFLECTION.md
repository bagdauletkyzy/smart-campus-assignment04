# Task #06 - AI reflection

**Student:** Bagdauletkyzy Akbota. **AI assistant:** Claude (Anthropic), 8 November 2026.

I gave the AI assistant the assignment slides, the acceptance criteria AC1-AC6, the new requirements F1-F5 and the constraints: fictional data, a fixed clock, no login, no database. I did not have my earlier prototype from Assignment #03, so the assistant rebuilt a single-room baseline (v1). This v1 is reconstructed, not my own earlier code, and the report says so.

**What was useful.** The layered split (data, domain, filters, service, render), pure functions with an injected "now", and frozen catalog data, so any accidental mutation throws. Returning result codes instead of parsing message text also made the tests simpler.

**What was weak or wrong.** The first duplication-counting script used a wrong pattern and showed 0 for one rule in v2; the numbers looked odd, so it was fixed and rerun. A first shell command also failed to create folders. A draft report had 13 instead of 12 duplicated copies; I recomputed it per rule. The suggested jsdom for UI tests was replaced by tests of pure render functions plus a browser smoke script. The work was also done in one pass instead of one change at a time with tests after each; this is noted in the report (section 8).

**What I verified myself.** I ran `npm test` in both folders on my computer: 9/9 in v1 and 37/37 in v2 (screenshots in the report). I opened the app in my browser and checked the room list and the Blocked marker. Because all 37 tests passed on the first run, I did not treat that as proof; four deliberately injected bugs (touching counted as overlap, 120 minutes treated as too long, "some" instead of "every" for equipment, stale result after switching rooms) were each caught by the tests.

**What I learned and would do next.** Tests are only trustworthy if they can fail, and keeping each rule in one place makes both changes and tests easier. Next time I would work in smaller steps with a commit and a test run after each one. For the project, I would add automated DOM-level UI tests and support for bookings that cross midnight.
