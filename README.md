# QA Dashboard

Test-management dashboard built on top of Genie Report data.

Genie Reports keeps a run for 90 days and only shows one run at a time. This
project pulls every run through the Genie Report API into PostgreSQL, keeps it
permanently, and builds cross-run views for test management: trends, failure
analysis, flakiness, coverage, release gates.

## Layout

```
qa-dashboard/
├── docs/DESIGN.md        # Genie API knowledge base, architecture, Postgres schema,
│                         # sync design, error-signature / flaky algorithms, roadmap
└── prototype/index.html  # Static UI prototype, single file, no external dependencies
```

Open `prototype/index.html` directly in a browser to walk through the seven
proposed pages: Overview, Run history, Failure analysis, Stability, Coverage &
test cases, Release gate, Data sync. All numbers are mock data shaped after the
OREO project.

## Status

Design draft v0.1. Open items are listed in `docs/DESIGN.md` section 8; the
sync job and schema migrations start once those are confirmed.
