# QA Dashboard

Test-management dashboard built on top of Genie Report data.

Genie Reports keeps a run for 90 days and only shows one run at a time. This
project pulls every run through the Genie Report API into PostgreSQL, keeps it
permanently, and builds cross-run views for test management: trends, failure
triage, flakiness, coverage, release gates.

## Layout

```
qa-dashboard/
├── docs/DESIGN.md              # Genie API knowledge base, architecture, tech stack,
│                               # Postgres schema, sync design, algorithms, roadmap
├── design/                     # v0.3 clickable prototype ("Control Room")
│   ├── qa-control-room.html    # open in a browser: every page on one canvas,
│   │                           # the top artboard is the clickable app
│   ├── src/*.dc.html           # page sources, one per page, plus System.dc.html
│   ├── _head.html              # design tokens: type ramp, inks, status steps
│   ├── canvas.json             # canvas layout
│   └── build.mjs               # injects _head.html into src/ -> artboards/
└── prototype/index.html        # v0.1 static prototype (superseded)
```

Open `design/qa-control-room.html` in a browser. The top artboard is the
clickable prototype: keys 1–7 switch views; classify a failure in Triage and
the Release gate rules update. All numbers are mock data shaped after the
OREO project. The "Design system" artboard carries the tokens, type ramp and
control anatomy the React build should follow.

## Status

Design draft v0.3. Tech stack (Spring Boot + MyBatis + PostgreSQL + React),
deployment (Azure DevOps pipeline) and the schema are in `docs/DESIGN.md`;
open items are in section 8.
