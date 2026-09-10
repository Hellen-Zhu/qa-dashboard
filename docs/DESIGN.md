# QA Dashboard — Solution Design

Status: draft v0.1 · 2026-09-10

## 1. Problem

The Genie framework publishes every automation run to Genie Reports
(`https://<genie-report-host>`). That UI is good for reading one run,
but it has three limits for test management:

1. Reports expire after 90 days unless retained manually.
2. There is no view across runs — no trend, no flakiness, no release-level verdict.
3. Filtering, comparison and failure triage are not supported.

The QA Dashboard pulls every run through the Genie Report API into PostgreSQL,
keeps it permanently, and builds test-management views on top. Step-level
detail stays in Genie: the dashboard stores the raw fragment JSON in a JSONB
column and links back to the original report for drill-down.

## 2. Genie Report API (knowledge base)

Base URL: `https://<genie-report-host>/api`

### 2.1 Authentication

| Step | Method | Path | Notes |
|---|---|---|---|
| Login | POST | `/auth/login` | Body `{"username":"<PSID>","password":"<pwd>"}` → short-lived token |
| Perm token | POST | `/auth/perm-token` | Empty body, header `Authorization: Bearer <login token>` → long-lived token |

All other calls use `Authorization: Bearer <perm token>`.

### 2.2 Reports

| Purpose | Method | Path | Body / params |
|---|---|---|---|
| List runs of a project | POST | `/reports/project` | `{"runIdentifier":"","projectId":"<id>","userId":"","labels":"","status":"","runStartTimeAfter":"<ISO>","runStartTimeBefore":null}` |
| List runs by release / GAID | POST | `/reports/project` | `{"projectId":"<id>","releaseName":"7425423","gaid":["50401"]}` (either or both) |
| Run summary | GET | `/reports/details/{runId}` | — |
| All fragments (scenarios) of a run | POST | `/reports/details/{runId}/fragments` | `{"featureName":null,"status":null,"tag":null,"duplication":null}` — paginated |
| One fragment | GET | `/reports/details/{runId}/fragments/{fragmentId}` | — |
| Fragment filter options | GET | `/reports/details/{runId}/fragment-filter-options` | — |
| Manual effort saved (seconds) | GET | `/reports/details/{runId}/manualeffort` | — |
| Retain a report | POST | `/reports/{runId}/_retain?projectId=<id>` | — |
| Latest tests for a release | GET | `/traceability/scenarios/_latest?releaseName=<id>` | optional `scenariosPageSize`, `scenarioIdToSearchAfter` |

### 2.3 Aggregated reports (three steps)

1. `GET /reports/aggregated/details/runlogs?ids=<runId1>-<runId2>`
2. `GET /reports/aggregated/details/fragment-status?ids=<runId1>-<runId2>`
3. `PUT /reports/aggregated` with a body shaped like a run summary plus
   `"runIds": [...]`; fragmentCount and status are summed by the caller.

### 2.4 Run summary — key fields (`GET /reports/details/{runId}`)

```
documentId              = "{projectId}.{runIdentifier}"
runIdentifier           = run / report id
runStartTime, runEndTime, runTimeZone
userId, hostname, javaVersion, genieVersion
genieModules[], genieRunArguments[], genieRunConfig[]
projectId
fragmentCount { passed, failed, skipped, deferred, blocked,
                executedTotal, expectedTotal, filteredTotal, grossTotal }
status                  = passed | failed
statusConfig { failOnSkipped, failOnDeferred, failOnBlocked }
labels[]                e.g. ["FullRegression"]
displayName, reportState (live), createDateTime, updateDateTime, updateUser
traceability { releaseName, applicationId, projectCode, suts[],
               testSourceDetails { repoUrl, branch, commitHash, hasModifiedFiles },
               jenkinsExecutionDetails {}, testDetails { jiraProjectIds[], linkages[] },
               executionType, testingTool }
manDayHours, modelVersion, requestInfo { source, target }
```

Notes: `executedTotal = passed+failed+skipped+deferred+blocked`;
`grossTotal − filteredTotal = executedTotal` (filtered = excluded by tag expression).
Step-level totals are **not** in the summary; they are summed from fragments.

### 2.5 Fragment — key fields (`POST /reports/details/{runId}/fragments`)

Envelope: `pageCurrent, pageTotal, recordFrom, recordTo, recordTotal, records[]`.

Per record (one scenario):

```
documentId              = "{projectId}.{runId}.{fragmentId}"
fragmentId, runIdentifier, projectId, userId
feature { name, description, tags[], keyword, location }
before { … }  after { … }                       hook results
scenario { id ("features/ui/trading/trade_fixings.feature:17"),
           name ("[TC-…] …"), tags[], keyword, locations[], steps[], result }
result { status, startDate, endDate,
         error { message, stackTrace[{methodName,fileName,lineNumber,className}] } }
resultConfig { failOnSkipped, failOnDeferred, failOnBlocked }
tags[]                  merged tags, e.g. @regression @positive @TC-TRADE-FIXINGS-UI-001
hash                    content hash of the scenario — changes when the script changes
labels[], runStartTime, createDateTime, reportState
traceabilityScenarioId  parsed TC id, e.g. TC-TRADE-FIXINGS-FX_TRF-UI-001
traceability { releaseName, applicationId, projectCode, … executionType, testingTool }
manualEffort, manDayHours, videos[], modelVersion, requestInfo
```

### 2.6 Genie UI ↔ API mapping

| Genie page | API |
|---|---|
| Summary | `GET /reports/details/{id}` |
| Scenarios list | `POST /reports/details/{id}/fragments` |
| Scenario expanded | `GET /reports/details/{id}/fragments/{fragmentId}` |
| Feature filter | `GET /reports/details/{id}/fragment-filter-options` |
| Features / Tags tabs | no dedicated API — aggregated from fragments |
| Manual Effort Saved | `GET /reports/details/{id}/manualeffort` |
| Retain button | `POST /reports/{id}/_retain` |

Deep links: `https://<genie-report-host>/reports/{runId}/{summary|features|tags|scenarios}`.

## 3. Architecture

```
┌──────────────┐   hourly    ┌──────────────┐          ┌──────────────┐
│ Genie Report │ ──────────► │  Sync job    │ ───────► │  PostgreSQL  │
│     API      │             │ (collector)  │          │              │
└──────────────┘             └──────────────┘          └──────┬───────┘
                                                              │
                                              ┌───────────────┴──────────────┐
                                              │  Dashboard API + web UI      │
                                              │  (or Grafana/Metabase first) │
                                              └──────────────────────────────┘
```

Three components, deliberately decoupled:

- **Sync job** — a scheduled process that logs in, refreshes the perm token,
  pulls new runs incrementally, fetches all fragments of each run, and writes
  normalised rows plus the raw JSON. Also runs the expiry watch / auto-retain.
- **PostgreSQL** — system of record. Raw JSONB is kept so any field can be
  back-filled later without re-pulling from Genie (which may have expired).
- **Dashboard** — reads only. Phase 1 can be Grafana or Metabase on top of
  SQL views; a custom UI (see `prototype/index.html`) comes once the views
  stabilise.

## 4. Data model

Detail lives in JSONB; only fields needed for filtering, joining and
aggregation are promoted to columns.

```sql
-- One row per Genie project
CREATE TABLE project (
  project_id      text PRIMARY KEY,           -- com_scb_oreo_oreo-e2e
  display_name    text,
  first_seen_at   timestamptz,
  last_seen_at    timestamptz
);

-- One row per run (Genie report)
CREATE TABLE test_run (
  run_id            text PRIMARY KEY,         -- runIdentifier
  project_id        text NOT NULL REFERENCES project,
  display_name      text,
  status            text NOT NULL,            -- passed | failed
  labels            text[] NOT NULL DEFAULT '{}',
  run_start_time    timestamptz NOT NULL,
  run_end_time      timestamptz,
  duration_sec      integer GENERATED ALWAYS AS
                    (EXTRACT(EPOCH FROM run_end_time - run_start_time)::int) STORED,
  user_id           text,
  hostname          text,
  genie_version     text,
  java_version      text,
  release_name      text,
  application_id    text,
  project_code      text,
  repo_url          text,
  branch            text,
  commit_hash       text,
  has_modified_files boolean,
  execution_type    text,
  passed            integer NOT NULL DEFAULT 0,
  failed            integer NOT NULL DEFAULT 0,
  skipped           integer NOT NULL DEFAULT 0,
  deferred          integer NOT NULL DEFAULT 0,
  blocked           integer NOT NULL DEFAULT 0,
  executed_total    integer NOT NULL DEFAULT 0,
  expected_total    integer,
  filtered_total    integer,
  gross_total       integer,
  man_day_hours     numeric,
  manual_effort_sec integer,                  -- from /manualeffort
  report_state      text,
  retained          boolean NOT NULL DEFAULT false,
  genie_created_at  timestamptz,
  genie_expires_at  timestamptz,              -- genie_created_at + 90 days
  genie_url         text,
  raw               jsonb NOT NULL,           -- full /reports/details response
  synced_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON test_run (project_id, run_start_time DESC);
CREATE INDEX ON test_run (release_name);
CREATE INDEX ON test_run USING gin (labels);

-- One row per scenario execution (Genie fragment)
CREATE TABLE scenario_result (
  fragment_id        text PRIMARY KEY,
  run_id             text NOT NULL REFERENCES test_run ON DELETE CASCADE,
  project_id         text NOT NULL,
  tc_id              text,                    -- traceabilityScenarioId
  scenario_name      text NOT NULL,
  scenario_uri       text,                    -- features/…/x.feature:17
  feature_name       text,
  status             text NOT NULL,           -- passed | failed | skipped | deferred | blocked | pending | undefined | ambiguous
  start_time         timestamptz,
  end_time           timestamptz,
  duration_ms        integer,
  tags               text[] NOT NULL DEFAULT '{}',
  labels             text[] NOT NULL DEFAULT '{}',
  scenario_hash      text,                    -- fragment.hash
  error_message      text,                    -- first line of result.error.message
  error_signature    text,                    -- normalised message hash, see §5.3
  error_class        text,                    -- top stack frame className
  step_total         integer,
  step_passed        integer,
  step_failed        integer,
  step_skipped       integer,
  manual_effort_sec  integer,
  genie_url          text,
  raw                jsonb NOT NULL,          -- full fragment incl. steps + stack
  synced_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON scenario_result (run_id);
CREATE INDEX ON scenario_result (project_id, tc_id, start_time DESC);
CREATE INDEX ON scenario_result (status);
CREATE INDEX ON scenario_result (error_signature);
CREATE INDEX ON scenario_result USING gin (tags);

-- Test-case dimension, maintained by the sync job
CREATE TABLE test_case (
  project_id     text NOT NULL,
  tc_id          text NOT NULL,
  latest_name    text,
  feature_name   text,
  latest_hash    text,
  first_seen_at  timestamptz,
  last_run_at    timestamptz,
  last_status    text,
  PRIMARY KEY (project_id, tc_id)
);

-- Human-maintained triage
CREATE TABLE known_issue (
  id              serial PRIMARY KEY,
  project_id      text NOT NULL,
  error_signature text,                       -- match by signature …
  tc_id           text,                       -- … or by test case
  category        text NOT NULL,              -- product_defect | script | environment | data
  jira_key        text,
  note            text,
  active          boolean NOT NULL DEFAULT true,
  created_by      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Release gate
CREATE TABLE release_gate_rule (
  id           serial PRIMARY KEY,
  project_id   text NOT NULL,
  rule_type    text NOT NULL,     -- min_pass_rate | tag_all_pass | no_unclassified | no_new_failures | branch_is
  param        jsonb NOT NULL,
  enabled      boolean NOT NULL DEFAULT true
);
CREATE TABLE release_verdict (
  id            serial PRIMARY KEY,
  project_id    text NOT NULL,
  release_name  text NOT NULL,
  gaid          text,
  evidence_run  text REFERENCES test_run,
  verdict       text NOT NULL,     -- passed | not_passed | waived
  decided_by    text,
  decided_at    timestamptz,
  note          text
);

-- Sync bookkeeping
CREATE TABLE sync_log (
  id            serial PRIMARY KEY,
  started_at    timestamptz NOT NULL,
  finished_at   timestamptz,
  kind          text NOT NULL,     -- incremental | backfill | retain
  runs_added    integer DEFAULT 0,
  fragments_added integer DEFAULT 0,
  status        text,
  message       text
);
```

Derived views (examples):

```sql
CREATE VIEW v_run_pass_rate AS
SELECT run_id, project_id, run_start_time, labels, branch,
       passed::numeric / NULLIF(executed_total,0) AS pass_rate
FROM test_run;

-- last N results per test case, for flakiness and consecutive-failure counts
CREATE VIEW v_tc_history AS
SELECT project_id, tc_id, run_id, start_time, status, scenario_hash,
       row_number() OVER (PARTITION BY project_id, tc_id ORDER BY start_time DESC) AS rn
FROM scenario_result
WHERE tc_id IS NOT NULL;
```

## 5. Sync job

### 5.1 Schedule and flow

Hourly:

1. Login → perm token (cache; refresh when < 24 h left or on 401).
2. For each configured project: `POST /reports/project` with
   `runStartTimeAfter = max(run_start_time) − 1 day` (overlap covers late uploads).
3. For each run not yet in `test_run`, or whose `updateDateTime` changed:
   - `GET /reports/details/{runId}` → upsert `test_run`.
   - `POST /reports/details/{runId}/fragments`, page through until
     `pageCurrent == pageTotal − 1` → upsert `scenario_result`.
   - `GET /reports/details/{runId}/manualeffort` → `manual_effort_sec`.
   - Upsert `test_case`.
4. Write `sync_log`.

Daily (02:00): expiry watch — runs with `genie_expires_at < now() + 7 days`
that match an auto-retain rule (e.g. referenced by `release_verdict`) get
`POST /reports/{id}/_retain`; set `retained = true`.

### 5.2 Idempotency and failure handling

- All writes are upserts keyed on `run_id` / `fragment_id`.
- A run is only marked complete when all fragment pages succeeded; partial
  runs are retried next cycle.
- HTTP 401 → refresh token once and retry; 5xx → exponential backoff, max 3.
- Never delete: if Genie deletes a report, the dashboard keeps its copy.

### 5.3 Error signature

Failure clustering needs a stable key. Normalise `result.error.message`:

1. Take the first line.
2. Replace numbers, UUIDs, run/fragment ids, timestamps and quoted values with `#`.
3. Append the top non-framework stack frame `className#methodName`.
4. `error_signature = sha1(normalised)`; keep the normalised text in
   `error_message` for display.

Type is derived from class names: `com.microsoft.playwright.impl.Connection*`
→ connection; `*AssertionsBase*` / `*AssertionError*` → assertion;
message contains `Timeout` → timeout; else other.

### 5.4 Flakiness

For each `(project_id, tc_id)` take the last 20 results where
`scenario_hash` equals the latest hash (script unchanged). Flaky score =
status flips / (n − 1). Listed when ≥ 0.15; a test case with a consistent
run of failures is *broken*, not flaky.

## 6. Dashboard features

Pages map 1:1 to `prototype/index.html`.

| Page | Question it answers | Main sources |
|---|---|---|
| Overview | Is automation healthy, better or worse than last month | `test_run`, `v_run_pass_rate` |
| Run history | What ran, on which branch/version, how long, link to Genie | `test_run` |
| Failure analysis | What is failing and why; environment vs product vs script; diff two runs | `scenario_result`, `known_issue` |
| Stability | Which cases are flaky and is it getting worse | `v_tc_history` |
| Coverage & test cases | Which TCs are automated, last run, last result, tag coverage, ROI | `test_case`, `scenario_result` |
| Release gate | Can this release go | `release_gate_rule`, `release_verdict` |
| Data sync | Is the data complete; what expires soon | `sync_log`, `test_run.genie_expires_at` |

Global filters on every page: project, release/GAID, date range, label,
tag, branch.

## 7. Roadmap

| Phase | Scope | Outcome |
|---|---|---|
| 1 — MVP | Sync job, schema, Overview + Run history, Genie deep links | Nothing is lost after 90 days; trend visible |
| 2 | Failure clustering, known_issue triage, run diff, flaky detection, TC inventory | Daily triage happens in the dashboard |
| 3 | Release gate, Jira link, alerts (pass rate < threshold, new signature, expiring reports), weekly email | Release decisions and reporting are data-driven |

## 8. Open items

- Confirm fragment pagination parameters (query string vs body) and page size.
- Service account vs personal PSID for the sync job; perm token lifetime.
- Whether the `features` / `tags` aggregation in the Genie UI has an
  undocumented API; otherwise aggregate from fragments (current plan).
- Hosting: where the sync job and PostgreSQL run inside the bank network.
