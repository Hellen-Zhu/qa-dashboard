# QA Dashboard — Solution Design

Status: draft v0.2 · 2026-09-11

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
                                              │  (one Spring Boot service)   │
                                              └──────────────────────────────┘
```

Three components, deliberately decoupled:

- **Sync job** — a scheduled process that logs in, refreshes the perm token,
  pulls new runs incrementally, fetches all fragments of each run, and writes
  normalised rows plus the raw JSON. Also runs the expiry watch / auto-retain.
- **PostgreSQL** — system of record. Raw JSONB is kept so any field can be
  back-filled later without re-pulling from Genie (which may have expired).
- **Dashboard** — REST API plus a React web UI, served by the same Spring
  Boot service as the sync job. Everything synced from Genie is read-only;
  the UI writes only human data (triage categories, Jira links, "known flaky"
  notes, gate snapshots). The UI follows the clickable prototype in `design/`.
  Grafana/Metabase are not used for the main UI because triage is a write
  workflow; they can be pointed at the same SQL views later for ad-hoc
  analysis.

### 3.1 Technology stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Java 21 + Spring Boot 3 | Team language; Genie itself is Java (Cucumber + Playwright Java) |
| Data access | MyBatis (MyBatis-Plus optional for simple CRUD tables) | SQL-first; heavy aggregation lives in views. Parameters only via `#{}`; dynamic sort columns are white-listed |
| Migrations | Flyway | §4.3 becomes `V1__init.sql` |
| Scheduling | Spring `@Scheduled` + ShedLock; Resilience4j for retry/backoff | Single active sync even with several instances |
| Database | PostgreSQL 14+ | JSONB, arrays + GIN, window functions, materialized views |
| Frontend | React + TypeScript + Vite | Prototype pages and data shapes port 1:1 |
| UI components | Ant Design v5, themed with the prototype's tokens (`design/_head.html`) | Rich tables, selects, date ranges; Chinese docs. Pending §8: team's frontend skills (alternatives: shadcn/ui, or Vue 3 + Element Plus) |
| Server state | TanStack Query | Caching, periodic refresh, invalidation after triage writes |
| Charts | Hand-written SVG + `d3-scale` / `d3-shape` | The run strip, status dots and thin bars are custom marks; chart libraries fight the look |
| Auth | Pluggable login filter; integrate the bank permission system later | Every logged-in user can read and write; all human changes are audited in `triage_log` |

### 3.2 Deployment

Azure DevOps pipeline to our own server: Maven build (the frontend is built
by `frontend-maven-plugin` and packaged into the Spring Boot jar) → tests →
copy the jar to the server → restart the service. One deployable; PostgreSQL
location is an open item (§8).

## 4. Data model

### 4.1 Principles

1. **Machine-written and human-written data live in separate tables.** The
   sync job only writes fact tables; triage (categories, Jira links, "known
   flaky") goes to human tables the sync job never touches. A re-sync or a
   backfill can never wipe out a person's classification.
2. **Raw JSON is split into its own tables.** Fact tables stay narrow and fast
   to scan; the raw payload is kept forever so new fields can be back-filled
   without going back to Genie (which may have expired the report).
3. **Surrogate `bigint` keys plus business unique keys.** Whether Genie's
   `runIdentifier` is globally unique is not confirmed yet (§8); single-column
   numeric keys also keep MyBatis joins simple.
4. **Status columns are `text` + `CHECK`, not PostgreSQL enums.** No custom
   MyBatis TypeHandler needed, and adding a value is a constraint change.
5. **Aggregation lives in views.** Flaky scores, feature health and trends are
   (materialized) views refreshed after each sync; Java code reads views.

### 4.2 Tables

| Group | Tables | Written by | Pages |
|---|---|---|---|
| Project & sync | `project`, `sync_log` | sync job | Data sync |
| Facts | `test_run`, `scenario_result`, `failure_signature`, `test_case` | sync job | all |
| Raw | `test_run_raw`, `scenario_result_raw` | sync job | back-fill, debugging |
| Human | `signature_triage`, `test_case_note`, `triage_log` | UI actions | Triage, Stability |
| Release gate | `release`, `gate_rule`, `gate_result` | config + UI actions | Release gate |
| Trend snapshots | `daily_metric` | sync job | Today, Stability |

```
project ─┬─< test_run ──< scenario_result >── failure_signature ── signature_triage
         │        │              │
         │        └─ test_run_raw └─ scenario_result_raw
         ├─< test_case ── test_case_note
         ├─< release ──< gate_result >── test_run (evidence run)
         └─< gate_rule / daily_metric / sync_log        triage_log: audit of every human change
```

### 4.3 DDL (draft — becomes Flyway `V1__init.sql`)

```sql
-- ============ Project & sync ============
CREATE TABLE project (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  genie_project_id text NOT NULL UNIQUE,          -- com_scb_oreo_oreo-e2e
  display_name     text,
  sync_enabled     boolean NOT NULL DEFAULT true,
  sync_cursor      timestamptz,                   -- max(run_start_time) synced so far
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sync_log (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id      bigint REFERENCES project,
  kind            text NOT NULL CHECK (kind IN ('incremental','backfill','expiry_watch')),
  status          text NOT NULL CHECK (status IN ('running','ok','partial','failed')),
  started_at      timestamptz NOT NULL,
  finished_at     timestamptz,
  runs_added      int NOT NULL DEFAULT 0,
  runs_updated    int NOT NULL DEFAULT 0,
  fragments_added int NOT NULL DEFAULT 0,
  retained_count  int NOT NULL DEFAULT 0,
  message         text
);

-- ============ Run (one Genie report) ============
CREATE TABLE test_run (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id       bigint NOT NULL REFERENCES project,
  run_identifier   text NOT NULL,
  display_name     text,
  status           text NOT NULL CHECK (status IN ('passed','failed')),
  labels           text[] NOT NULL DEFAULT '{}',   -- FullRegression / Smoke
  run_start_time   timestamptz NOT NULL,
  run_end_time     timestamptz,
  duration_sec     int GENERATED ALWAYS AS
                   (EXTRACT(EPOCH FROM run_end_time - run_start_time)::int) STORED,
  -- environment
  user_id text, hostname text, genie_version text, java_version text,
  release_name text, application_id text,            -- application_id = GAID
  repo_url text, branch text, commit_hash text, has_modified_files boolean, execution_type text,
  -- counts (fragmentCount)
  passed int NOT NULL DEFAULT 0, failed int NOT NULL DEFAULT 0, skipped int NOT NULL DEFAULT 0,
  deferred int NOT NULL DEFAULT 0, blocked int NOT NULL DEFAULT 0,
  executed_total int NOT NULL DEFAULT 0, expected_total int, filtered_total int, gross_total int,
  pass_rate        numeric GENERATED ALWAYS AS
                   (CASE WHEN executed_total > 0 THEN passed::numeric / executed_total END) STORED,
  manual_effort_sec int,
  -- relation to Genie
  genie_created_at timestamptz,
  genie_updated_at timestamptz,                    -- updateDateTime; re-fetch when it changes
  genie_expires_at timestamptz,                    -- created + 90 days
  retained         boolean NOT NULL DEFAULT false,
  retained_at      timestamptz,
  genie_url        text,
  synced_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, run_identifier)
);
CREATE INDEX ON test_run (project_id, run_start_time DESC);
CREATE INDEX ON test_run (project_id, release_name);
CREATE INDEX ON test_run USING gin (labels);

CREATE TABLE test_run_raw (
  run_id  bigint PRIMARY KEY REFERENCES test_run ON DELETE CASCADE,
  payload jsonb NOT NULL                            -- full /reports/details response
);

-- ============ Error signature (the unit of triage) ============
CREATE TABLE failure_signature (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id      bigint NOT NULL REFERENCES project,
  sig_hash        text NOT NULL,                    -- sha1(normalised text + top frame), §5.3
  normalized_text text NOT NULL,                    -- "Timeout #ms exceeded waiting for ..."
  top_frame       text,                             -- className#methodName
  error_type      text NOT NULL CHECK (error_type IN ('connection','assertion','timeout','other')),
  sample_message  text,                             -- latest raw message, shown in Triage detail
  first_seen_at   timestamptz NOT NULL,
  last_seen_at    timestamptz NOT NULL,
  UNIQUE (project_id, sig_hash)
);

-- ============ Scenario result (one fragment) ============
CREATE TABLE scenario_result (
  id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id         bigint NOT NULL REFERENCES test_run ON DELETE CASCADE,
  project_id     bigint NOT NULL REFERENCES project,   -- denormalised for per-project queries
  fragment_id    text NOT NULL,
  tc_id          text,                                 -- traceabilityScenarioId
  scenario_name  text NOT NULL,
  scenario_uri   text,                                 -- features/ui/x.feature:17
  feature_name   text,
  status         text NOT NULL CHECK (status IN ('passed','failed','skipped','deferred',
                                                 'blocked','pending','undefined','ambiguous')),
  start_time     timestamptz,
  duration_ms    int,
  tags           text[] NOT NULL DEFAULT '{}',
  scenario_hash  text,                                 -- script content hash
  error_message  text,                                 -- first line of the raw error
  signature_id   bigint REFERENCES failure_signature,
  step_total int, step_passed int, step_failed int, step_skipped int,
  manual_effort_sec int,
  UNIQUE (run_id, fragment_id)
);
CREATE INDEX ON scenario_result (project_id, tc_id, start_time DESC);
CREATE INDEX ON scenario_result (signature_id, start_time DESC);
CREATE INDEX ON scenario_result USING gin (tags);

CREATE TABLE scenario_result_raw (
  result_id bigint PRIMARY KEY REFERENCES scenario_result ON DELETE CASCADE,
  payload   jsonb NOT NULL                              -- steps + stack traces; most of the volume
);

-- ============ Test-case dimension ============
CREATE TABLE test_case (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id    bigint NOT NULL REFERENCES project,
  tc_id         text NOT NULL,
  latest_name   text,
  feature_name  text,
  scenario_uri  text,
  latest_tags   text[] NOT NULL DEFAULT '{}',
  latest_hash   text,
  first_seen_at timestamptz,
  last_run_at   timestamptz,
  last_status   text,
  UNIQUE (project_id, tc_id)
);

-- ============ Human data (the sync job never writes these) ============
CREATE TABLE signature_triage (
  signature_id bigint PRIMARY KEY REFERENCES failure_signature,
  category     text CHECK (category IN ('env','defect','script','data')),  -- NULL = unclassified
  jira_key     text,
  note         text,
  updated_by   text NOT NULL,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE test_case_note (                              -- Stability page "Mark as known"
  test_case_id bigint PRIMARY KEY REFERENCES test_case,
  flaky_known  boolean NOT NULL DEFAULT false,
  jira_key     text,
  note         text,
  updated_by   text NOT NULL,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE triage_log (                                  -- everyone can write, so every change is logged
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id  bigint NOT NULL REFERENCES project,
  target_type text NOT NULL CHECK (target_type IN ('signature','test_case')),
  target_id   bigint NOT NULL,
  field       text NOT NULL,                               -- category / jira_key / flaky_known
  old_value   text,
  new_value   text,
  changed_by  text NOT NULL,
  changed_at  timestamptz NOT NULL DEFAULT now()
);

-- ============ Release gate (no waiver for now) ============
CREATE TABLE release (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id   bigint NOT NULL REFERENCES project,
  release_name text NOT NULL,                              -- Genie releaseName
  gaid         text,
  display_name text,                                       -- "OREO R2.3"
  status       text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  UNIQUE (project_id, release_name)
);

CREATE TABLE gate_rule (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  project_id bigint NOT NULL REFERENCES project,
  rule_type  text NOT NULL CHECK (rule_type IN ('min_pass_rate','tag_all_pass','no_unclassified',
                                                'defect_has_jira','no_new_failures','branch_is')),
  param      jsonb NOT NULL DEFAULT '{}',                  -- {"min":0.98} / {"tag":"@smoke"}
  enabled    boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE gate_result (                                 -- snapshot taken on "Record verdict"
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  release_id      bigint NOT NULL REFERENCES release,
  evidence_run_id bigint NOT NULL REFERENCES test_run,     -- auto-retained in Genie
  verdict         text NOT NULL CHECK (verdict IN ('passed','not_passed')),
  pass_rate       numeric,
  rule_results    jsonb NOT NULL,                          -- per-rule outcome + detail
  recorded_by     text NOT NULL,
  recorded_at     timestamptz NOT NULL DEFAULT now()
);

-- ============ Daily metric snapshots ============
CREATE TABLE daily_metric (
  project_id  bigint NOT NULL REFERENCES project,
  metric_date date   NOT NULL,
  metric      text   NOT NULL,        -- flaky_ratio / untriaged_count / tc_count / pass_rate_7d
  value       numeric NOT NULL,
  PRIMARY KEY (project_id, metric_date, metric)
);
```

### 4.4 Derived views

Flaky score, matching §5.4: filter to the latest script hash first, then take
the last 20 results, then count status flips.

```sql
CREATE MATERIALIZED VIEW mv_tc_stability AS
WITH base AS (
  SELECT project_id, tc_id, status, start_time, scenario_hash,
         first_value(scenario_hash) OVER (PARTITION BY project_id, tc_id
                                          ORDER BY start_time DESC) AS latest_hash
  FROM scenario_result
  WHERE tc_id IS NOT NULL AND status IN ('passed','failed')
), same_script AS (
  SELECT *, row_number() OVER (PARTITION BY project_id, tc_id ORDER BY start_time DESC) AS rn
  FROM base WHERE scenario_hash IS NOT DISTINCT FROM latest_hash
), last20 AS (
  SELECT *, lag(status) OVER (PARTITION BY project_id, tc_id ORDER BY start_time) AS prev
  FROM same_script WHERE rn <= 20
)
SELECT project_id, tc_id,
       count(*) AS n,
       count(*) FILTER (WHERE status <> prev) AS flips,
       round(count(*) FILTER (WHERE status <> prev)::numeric / NULLIF(count(*) - 1, 0), 2) AS flaky_score,
       string_agg(left(status, 1), '' ORDER BY start_time) AS dots   -- "ppfp…" for the UI
FROM last20
GROUP BY project_id, tc_id;

CREATE UNIQUE INDEX ON mv_tc_stability (project_id, tc_id);   -- needed for REFRESH ... CONCURRENTLY
```

Other views, same approach:

- `v_run` — `test_run` plus "expired in Genie" (`genie_expires_at < now()`;
  `now()` cannot be a generated column).
- `mv_feature_health` — per feature over the last 10 runs: pass rate, average
  duration, flaky count, latest status.
- `v_signature_stats` — per signature: test cases affected and hits in the
  last 14 days, joined with `signature_triage`.
- `v_test_case_inventory` — 30-day pass rate and "not run for 14+ days".

Gate rules are evaluated live in Java from these views; `gate_result` is only
written when someone records a verdict.

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
4. Refresh materialized views (`REFRESH MATERIALIZED VIEW CONCURRENTLY`),
   write today's `daily_metric` rows, write `sync_log`.

Daily (02:00): expiry watch — runs with `genie_expires_at < now() + 7 days`
that match an auto-retain rule (e.g. evidence run of a `gate_result`) get
`POST /reports/{id}/_retain`; set `retained = true`.

### 5.2 Idempotency and failure handling

- All writes are upserts keyed on `(project_id, run_identifier)` /
  `(run_id, fragment_id)`.
- The sync job never writes the human tables (`signature_triage`,
  `test_case_note`, `triage_log`, `gate_result`).
- A run is only marked complete when all fragment pages succeeded; partial
  runs are retried next cycle.
- HTTP 401 → refresh token once and retry; 5xx → exponential backoff, max 3.
- Never delete: if Genie deletes a report, the dashboard keeps its copy.

### 5.3 Error signature

Failure clustering needs a stable key. Normalise `result.error.message`:

1. Take the first line.
2. Replace numbers, UUIDs, run/fragment ids, timestamps and quoted values with `#`.
3. Append the top non-framework stack frame `className#methodName`.
4. Upsert `failure_signature` keyed on `sha1(normalised)`; the normalised
   text goes to `failure_signature.normalized_text`, the raw first line stays
   in `scenario_result.error_message`.

Type is derived from class names: `com.microsoft.playwright.impl.Connection*`
→ connection; `*AssertionsBase*` / `*AssertionError*` → assertion;
message contains `Timeout` → timeout; else other.

### 5.4 Flakiness

For each `(project_id, tc_id)` take the last 20 results where
`scenario_hash` equals the latest hash (script unchanged). Flaky score =
status flips / (n − 1). Listed when ≥ 0.15; a test case with a consistent
run of failures is *broken*, not flaky.

## 6. Dashboard features

Pages map 1:1 to the clickable prototype in `design/` (v0.2, "Control
Room"). The v0.1 static prototype is kept in `prototype/index.html`.

| Page | Question it answers | Main sources |
|---|---|---|
| Today | Is automation healthy right now, and what is the one next action | `v_run`, `mv_feature_health`, `daily_metric` |
| Runs | What ran, on which branch/version, how long, link to Genie; diff two runs aligned by TC ID | `test_run`, `scenario_result` |
| Triage | What is failing and why; one-click category per error signature | `v_signature_stats`, `signature_triage` |
| Stability | Which cases are flaky and is it getting worse | `mv_tc_stability`, `test_case_note`, `daily_metric` |
| Test cases | Which TCs are automated, last run, last result, tag coverage, manual hours saved | `v_test_case_inventory`, `test_case` |
| Release gate | Can this release go; rule-by-rule result, no waiver for now | `gate_rule`, `gate_result`, views above |
| Data sync | Is the data complete; what expires soon | `sync_log`, `test_run.genie_expires_at` |

The core loop: a category set in Triage is read live by the gate rules
"no unclassified failures" and "every product defect is linked to Jira".

Global filters on every page: project, release/GAID, date range, label,
tag, branch.

## 7. Roadmap

| Phase | Scope | Outcome |
|---|---|---|
| 1 — MVP | Sync job, schema, Today + Runs + Data sync, Genie deep links, ADO pipeline | Nothing is lost after 90 days; trend visible |
| 2 | Error signatures + Triage, Release gate (no waiver), Stability, run diff | Daily triage and release checks happen in the dashboard |
| 3 | Test cases inventory, Jira integration, alerts (pass rate < threshold, new signature, expiring reports), weekly email, bank permission system | Reporting is data-driven; access is managed centrally |

## 8. Open items

- Confirm fragment pagination parameters (query string vs body) and page size.
- Service account vs personal PSID for the sync job; perm token lifetime.
- Whether the `features` / `tags` aggregation in the Genie UI has an
  undocumented API; otherwise aggregate from fragments (current plan).
- Hosting: the service is deployed to our server via ADO pipeline; where
  PostgreSQL runs is still open.
- Is Genie's `runIdentifier` globally unique or only unique per project?
  (Schema assumes per project, which works either way.)
- Scenarios without a TC ID: fall back to `scenario_uri` as the test-case key?
- Raw JSON is kept forever (~2.1 GB today): confirm server disk capacity for
  the expected run frequency.
- Release display names ("OREO R2.3"): available from Genie, or maintained in
  the dashboard?
- Frontend skills in the team (React vs Vue) — decides Ant Design vs the
  alternatives in §3.1.
- Login: integrate the bank permission system (phase 3); until then every
  logged-in user can read and write.
- Waiver on the release gate is out of scope for now.
