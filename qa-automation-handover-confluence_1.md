# QA Automation Handover — Status, Gaps & Risks

> **How to use this page:** everything in `<angle brackets>` is a placeholder — replace before publishing. Keep this page factual and evidence-based: record what was asked, what was answered, and what was observed. Avoid characterising intent. A neutral record is far more effective in an escalation than a critical one.

---

## Page properties

| Field | Value |
|---|---|
| **Owner** | `<Your name>` — Incoming QA Lead |
| **Outgoing team / vendor** | `<Team or vendor name>` |
| **Handover start date** | `<YYYY-MM-DD>` |
| **Target handover completion** | `<YYYY-MM-DD>` |
| **Current status** | 🔴 **BLOCKED — handover not accepted** |
| **Last updated** | `<YYYY-MM-DD>` |
| **Stakeholders** | `<Your manager>`, `<Their delivery manager>`, `<Programme / Transition manager>` |
| **Related** | `<Link to SOW / Transition Plan>`, `<Link to Jira epic>` |

---

## 1. Purpose

This page is the single source of truth for the transfer of automated test ownership for `<Product / Stream>` from `<Outgoing team>` to `<Incoming team>`. It records:

- what was expected to be handed over vs. what was actually received;
- open gaps preventing the incoming team from operating the suite;
- requests raised with the outgoing team and their responses;
- the measured baseline established by the incoming team;
- the acceptance criteria that must be met before handover is signed off.

**This page does not assign blame.** It exists so that both parties work from the same facts, and so that quality outcomes after the transition date can be attributed correctly.

---

## 2. Executive summary

> ℹ️ **Current position:** The automation suite as delivered cannot be built and executed by the incoming team in a repeatable way. `<N>` blocking gaps remain open, of which `<M>` require action from the outgoing team and cannot be resolved by the incoming team alone. Handover acceptance criteria are **not met**.

| Metric | Value |
|---|---|
| Blocking gaps open | `<N>` |
| Gaps requiring outgoing-team action | `<M>` |
| Deliverables received complete | `<X>` of `<Y>` |
| Stated pass rate on Genesis (per outgoing team, verbal) | ~80%+ *(unevidenced — no run report provided)* |
| Measured pass rate, incoming team local run | `<Z>%` |
| Test cases blocked by unresolved dependency issues | `<n>` |
| Verified baseline available for comparison | **No** |

**Top three blockers**

1. Private dependencies required to build the suite have not been provided (**GAP-003**).
2. No execution evidence from Genesis has been provided, so the stated ~80% pass rate cannot be verified or used as a baseline (**GAP-007**).
3. No access to Genesis or to the feature test repository, so pipeline configuration and the exact delivered version are unknown (**GAP-004, GAP-005**).

---

## 3. Context — how the suite is built and run

### 3.1 Components

| Component | Description | Owned by | Access status |
|---|---|---|---|
| **Genesis** | Execution platform. The suite runs here via pipeline; all historical results live here. | `<Outgoing org>` | ❌ Not granted to incoming team |
| **Genie framework** | Core automation framework repository. | `<Owner>` | ✅ Received as `<snapshot / repo>` |
| **Feature test repo** | Feature-level test cases, integrated with Genesis via pipeline. | `<Owner>` | ⚠️ Received as code snapshot only — no repository access, no version identifier |
| **Private dependencies** | Internal libraries the framework and tests depend on. | `<Outgoing org>` | ❌ Not provided — declared "out of scope" |

### 3.2 Original vs. current execution model

| | Original (outgoing team) | Current (incoming team) |
|---|---|---|
| Integration | Automated via Genesis pipeline | **Manual copy/paste** of feature test repo code into the genie framework repo |
| Execution | Genesis pipeline | Local / traditional execution |
| Dependency resolution | Resolved by Genesis build environment | Must be resolved manually — currently blocked |
| Results & reporting | Genesis run reports | Local reports only |

> ⚠️ **Key structural risk:** the incoming team is being asked to reproduce, by hand, an execution model that was never designed to run outside Genesis. The manual integration step is undocumented, unversioned and error-prone, and is itself a source of failures that cannot be distinguished from pre-existing test defects without a baseline.

---

## 4. Deliverables checklist — expected vs. received

Legend: ✅ Received & usable · ⚠️ Received but incomplete/unusable · ❌ Not received

| # | Deliverable | Status | Notes |
|---|---|---|---|
| D-01 | Genie framework source | ✅ | `<version / date received>` |
| D-02 | Feature test repo source — **current** version | ⚠️ | First drop was not the latest version and could not be deployed. Second drop supplied `<YYYY-MM-DD>`. No version identifier supplied with either. |
| D-03 | Repository access (git) or commit hash / tag for delivered code | ❌ | Code delivered as a snapshot. No history, no traceable version. |
| D-04 | Genesis platform access (read-only acceptable) | ❌ | Declined. |
| D-05 | Pipeline definition (YAML), build image, environment variables | ❌ | Not provided. |
| D-06 | Private dependency artefacts, or repository coordinates + read credentials, or offline copies | ❌ | Declined as "out of scope". **Suite cannot be built without these.** |
| D-07 | Dependency manifest / lock file with pinned versions | ❌ | Not provided. |
| D-08 | Runtime & environment specification (language/runtime versions, browser versions, config, target environment, test accounts) | ❌ | Not provided. |
| D-09 | Execution reports from Genesis — last `<5–10>` pipeline runs (JUnit XML / HTML / Allure + logs) | ❌ | Not provided. **This is existing output, not new work.** |
| D-10 | Known-issues list: known-failing, known-flaky and data-dependent test cases | ❌ | Not provided, despite failures being attributed to market data variation. |
| D-11 | Test data strategy / market data handling documentation | ❌ | Not provided. |
| D-12 | Integration instructions: how feature test repo code is combined with genie framework | ❌ | Not provided. Currently performed manually by incoming team. |
| D-13 | Documented baseline pass rate with supporting evidence | ❌ | Verbal statement of ~80%+ only. Request for an evidenced baseline declined. |
| D-14 | Knowledge transfer sessions / walkthrough | `<✅/⚠️/❌>` | `<Detail>` |
| D-15 | Support / hypercare period after cutover | `<✅/⚠️/❌>` | `<Detail>` |

---

## 5. Gap & issue log

Severity: **S1** = blocks handover · **S2** = blocks normal operation · **S3** = significant limitation · **S4** = minor

| ID | Date raised | Category | Description | Evidence | Impact | Action owner | Status | Sev |
|---|---|---|---|---|---|---|---|---|
| **GAP-001** | `<YYYY-MM-DD>` | Deliverable completeness | First delivery of the feature test repo was not the current version; the suite could not be deployed. | `<Link: file hash, date, deployment error log>` | Handover start delayed by `<N>` days; rework of setup effort. | Outgoing team | ✅ Closed — superseded by second delivery | S2 |
| **GAP-002** | `<YYYY-MM-DD>` | Deliverable completeness | Second delivery: a subset of test cases cannot execute. Investigation by the incoming team traced the cause to outdated/mismatched versions of internal dependencies referenced by the delivered code. | `<Link: failure logs, dependency resolution errors>` | `<n>` test cases cannot run. | Incoming team (diagnosis complete) → Outgoing team (remediation) | 🔴 Open | S1 |
| **GAP-003** | `<YYYY-MM-DD>` | Access / dependency | The private dependencies required to build the delivered code have not been provided. Request declined; reason given: "out of scope". | `<Link: email / IM thread>` | **The delivered source cannot be built. Delivery is not functionally complete.** | Outgoing team | 🔴 Open | S1 |
| **GAP-004** | `<YYYY-MM-DD>` | Access | No access granted to the feature test repository. Code supplied as a snapshot with no commit hash, tag or history. | `<Link>` | Cannot verify which version was received, cannot detect drift, cannot trace changes, no upgrade path. | Outgoing team / `<Repo owner>` | 🔴 Open | S1 |
| **GAP-005** | `<YYYY-MM-DD>` | Access | No access granted to the Genesis platform (including read-only). | `<Link>` | Cannot view pipeline configuration, historical run results or reports. Cannot verify the stated pass rate. | Outgoing team / Genesis owner | 🔴 Open | S1 |
| **GAP-006** | `<YYYY-MM-DD>` | Process / architecture | Integration of feature test repo code into the genie framework is performed manually (copy/paste). No documented, repeatable or version-controlled integration procedure exists outside Genesis. | `<Link: current manual steps>` | Non-reproducible setup; manual-integration errors cannot be distinguished from genuine test failures. Not sustainable for ongoing ownership. | Joint | 🔴 Open | S1 |
| **GAP-007** | `<YYYY-MM-DD>` | Baseline / evidence | Pass rate measured locally by the incoming team is materially below the ~80%+ stated by the outgoing team at handover. No execution evidence supporting the stated figure has been provided. | `<Link: local run results, section 7>` | The quality of the delivered suite cannot be assessed. Root-cause attribution between "delivered defects" and "incoming team setup" is impossible. | Outgoing team | 🔴 Open | S1 |
| **GAP-008** | `<YYYY-MM-DD>` | Baseline / evidence | Request for the outgoing team to produce a reference run for comparison was declined; stated reason: they do not run the suite locally, only on Genesis. | `<Link>` | No agreed reference point. See **REQ-01** — request reframed to ask for existing Genesis run reports instead, which requires no local execution. | Outgoing team | 🔴 Open | S1 |
| **GAP-009** | `<YYYY-MM-DD>` | Test design / determinism | Failures attributed by the outgoing team to "market data changes". No list of data-dependent or known-flaky cases has been provided. | `<Link>` | Indicates the suite lacks test data isolation/determinism. This is a **quality characteristic of the delivered asset**, not an explanation for the observed failure rate. Results are not reproducible run-to-run. | Outgoing team (list) → Incoming team (remediation plan) | 🔴 Open | S2 |
| **GAP-010** | `<YYYY-MM-DD>` | Documentation | No runtime or environment specification provided (runtime versions, browser versions, configuration, target environment, test accounts/credentials). | `<Link>` | Environment differences cannot be ruled out as a cause of failures. | Outgoing team | 🔴 Open | S2 |
| **GAP-011** | `<YYYY-MM-DD>` | Documentation | No known-issues register provided (known-failing / known-flaky / quarantined cases). | `<Link>` | Incoming team is investigating failures that the outgoing team may already know about, duplicating effort. | Outgoing team | 🔴 Open | S2 |
| **GAP-012** | `<YYYY-MM-DD>` | Handover process | Diagnostic responsibility for failures in the delivered suite has been directed to the incoming team in each instance, without accompanying documentation, system access or a support commitment. | `<Links to threads>` | Unbounded and unplanned effort on the incoming team; handover timeline at risk; no defined end state. | Escalation — `<Delivery managers>` | 🔴 Open | S1 |

---

## 6. Outstanding requests to the outgoing team

Requests are ordered by ease of fulfilment. Items R-01 to R-03 require **no new work** — they ask only for artefacts that already exist.

| ID | Request | Why it is in scope | Effort for outgoing team | Raised | Response | Status |
|---|---|---|---|---|---|---|
| **REQ-01** | Export of the last `<5–10>` Genesis pipeline run reports (JUnit XML / HTML / Allure) with logs and corresponding commit hashes. | This is the evidence for the ~80%+ pass rate stated at handover, and it is the only available baseline. It does not require running the suite locally. | Low — export of existing output | `<YYYY-MM-DD>` | `<Pending>` | 🔴 Open |
| **REQ-02** | The commit hash or tag of the feature test repo version delivered, and of the genie framework version it was validated against. | Required to identify what was actually delivered. | Minimal | `<YYYY-MM-DD>` | `<Pending>` | 🔴 Open |
| **REQ-03** | Dependency manifest / lock file with pinned versions, **and** either (a) artefact repository coordinates + read-only credentials, or (b) offline copies of the private packages. | The delivered source cannot be compiled or executed without them. Code that cannot be built has not been functionally delivered. Requesting confirmation of which clause of `<SOW / Transition Plan>` places this outside scope. | Low | `<YYYY-MM-DD>` | Declined — "out of scope" | 🔴 Open — escalated |
| **REQ-04** | Read-only Genesis access for `<names>`. | Required for pipeline configuration, run history and reporting. | Low–medium (access request) | `<YYYY-MM-DD>` | `<Pending>` | 🔴 Open |
| **REQ-05** | Pipeline definition (YAML), build image reference, environment variables, and the procedure by which feature test repo code is combined with the genie framework. | Required to reproduce the execution environment and replace the manual integration step. | Low | `<YYYY-MM-DD>` | `<Pending>` | 🔴 Open |
| **REQ-06** | Runtime & environment specification: runtime/language versions, browser versions, configuration files, target test environment, test accounts. | Required to eliminate environment variance as a cause of failures. | Low | `<YYYY-MM-DD>` | `<Pending>` | 🔴 Open |
| **REQ-07** | List of known-failing, known-flaky and market-data-dependent test cases. | Directly follows from the outgoing team's own attribution of failures to market data variation. | Low | `<YYYY-MM-DD>` | `<Pending>` | 🔴 Open |
| **REQ-08** | Two time-boxed joint debugging sessions of 2 hours each, with `<names>`, before `<date>`. | Time-boxed and bounded; does not constitute ongoing support. | 4 hours total | `<YYYY-MM-DD>` | `<Pending>` | 🔴 Open |
| **REQ-09** | Read-only access to the feature test repository, or a git bundle including history. | Required for version traceability and future maintenance. | Low | `<YYYY-MM-DD>` | `<Pending>` | 🔴 Open |

> 💡 **Note on REQ-08:** a bounded request ("two 2-hour sessions before `<date>`") is materially easier for the other side to approve than an open-ended one ("please help us debug"). If individual contributors are declining, the constraint may be allocated capacity rather than willingness — in which case the request should be directed to `<their delivery manager>` rather than repeated to the individuals.

---

## 7. Communication & decision log

Record every substantive exchange. For verbal or IM discussions, send a written summary within 24 hours and link it here, so that the record is agreed rather than asserted.

| # | Date | Channel | Participants | Subject | Position stated / decision | Written confirmation | Related |
|---|---|---|---|---|---|---|---|
| C-01 | `<YYYY-MM-DD>` | `<Meeting>` | `<Names>` | Handover kick-off | Outgoing team stated the suite achieves >80% pass rate on Genesis. | `<Link to minutes email>` | GAP-007 |
| C-02 | `<YYYY-MM-DD>` | `<Email>` | `<Names>` | First code drop | Version supplied was not current; could not be deployed. | `<Link>` | GAP-001 |
| C-03 | `<YYYY-MM-DD>` | `<Email>` | `<Names>` | Second code drop | Subset of cases non-executable; incoming team asked to investigate. | `<Link>` | GAP-002 |
| C-04 | `<YYYY-MM-DD>` | `<Email / IM>` | `<Names>` | Private dependency request | Declined. Reason recorded: "out of scope". | `<Link>` | GAP-003, REQ-03 |
| C-05 | `<YYYY-MM-DD>` | `<Email / IM>` | `<Names>` | Low local pass rate | Attributed to market data changes; incoming team asked to investigate. | `<Link>` | GAP-007, GAP-009 |
| C-06 | `<YYYY-MM-DD>` | `<Email / IM>` | `<Names>` | Request for reference/baseline run | Declined. Reason recorded: outgoing team does not run the suite locally; execution occurs only on Genesis. | `<Link>` | GAP-008, REQ-01 |
| C-07 | `<YYYY-MM-DD>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |

**Suggested wording for written confirmations**

> Following today's discussion, my understanding is:
> 1. `<point>`
> 2. `<point>`
> 3. `<position stated by outgoing team, quoted as given>`
>
> Please reply with any correction by `<date>`; otherwise we will proceed on this basis and record it on `<link to this page>`.

---

## 8. Baseline established by the incoming team

Because no reference run has been provided, the incoming team is establishing its own measured baseline. Method: execute the full suite `<3>` times on `<date>` against `<environment>`, classify every failure by root cause, and record per-case results.

### 8.1 Run summary

| Run | Date | Commit / snapshot | Environment | Total | Passed | Failed | Errored | Skipped | Pass rate | Duration |
|---|---|---|---|---|---|---|---|---|---|---|
| Run 1 | `<YYYY-MM-DD>` | `<id>` | `<env>` | `<n>` | `<n>` | `<n>` | `<n>` | `<n>` | `<%>` | `<hh:mm>` |
| Run 2 | `<YYYY-MM-DD>` | `<id>` | `<env>` | `<n>` | `<n>` | `<n>` | `<n>` | `<n>` | `<%>` | `<hh:mm>` |
| Run 3 | `<YYYY-MM-DD>` | `<id>` | `<env>` | `<n>` | `<n>` | `<n>` | `<n>` | `<n>` | `<%>` | `<hh:mm>` |

**Stability across the three runs:** `<n>` cases passed consistently · `<n>` failed consistently · **`<n>` produced different results between runs (non-deterministic)**.

### 8.2 Failure root-cause classification

| Class | Definition | Count | % of failures | Resolvable by incoming team? | Related gap |
|---|---|---|---|---|---|
| **A — Environment / build** | Missing or mismatched dependencies; suite cannot start | `<n>` | `<%>` | ❌ No — requires REQ-03 | GAP-002, GAP-003 |
| **B — Framework / integration** | Introduced by manual merge of feature test repo into genie framework | `<n>` | `<%>` | ⚠️ Partially — requires REQ-05 | GAP-006 |
| **C — Test data / determinism** | Market data or test data variation; non-reproducible results | `<n>` | `<%>` | ⚠️ Partially — requires REQ-07 | GAP-009 |
| **D — Test case defect** | Hardcoded assertions, timing/synchronisation issues, obsolete locators | `<n>` | `<%>` | ✅ Yes | — |
| **E — Suspected product defect** | Genuine application-under-test issue | `<n>` | `<%>` | ✅ Yes — raise as defect | — |
| **F — Unclassified** | Insufficient information to determine cause | `<n>` | `<%>` | — | — |
| | **Total failures** | `<n>` | 100% | | |

> ℹ️ **Why this matters:** classes A, B and C together account for `<n>` of `<n>` failures. These cannot be resolved by the incoming team without the outstanding requests in section 6. Only classes D and E fall within the incoming team's ability to remediate with the assets currently held.

### 8.3 Per-case results

| Case ID | Suite / module | Run 1 | Run 2 | Run 3 | Deterministic | Class | Failure summary | Notes / evidence |
|---|---|---|---|---|---|---|---|---|
| `<TC-001>` | `<module>` | ✅ | ✅ | ✅ | Yes | — | — | |
| `<TC-002>` | `<module>` | ❌ | ❌ | ❌ | Yes | A | `<error>` | `<log link>` |
| `<TC-003>` | `<module>` | ✅ | ❌ | ✅ | **No** | C | `<error>` | `<log link>` |
| `<...>` | | | | | | | | |

> Attach the raw run artefacts (JUnit XML, logs, screenshots) to this page. Keep the raw files — do not overwrite them between runs.

---

## 9. Handover acceptance criteria (Definition of Done)

Handover is **not** complete until all criteria below are met, or a documented exception is formally agreed.

| # | Criterion | Met | Evidence |
|---|---|---|---|
| A-01 | The delivered source builds successfully in the incoming team's environment from a documented procedure. | ❌ | |
| A-02 | All dependencies, including private ones, are resolvable by the incoming team. | ❌ | |
| A-03 | The exact delivered version is identified (commit hash / tag) and under version control accessible to the incoming team. | ❌ | |
| A-04 | The full suite executes end to end and produces a report. | `<❌/✅>` | |
| A-05 | A reference pass rate is evidenced by execution artefacts, not by verbal statement. | ❌ | |
| A-06 | Measured pass rate in the incoming team's environment is within `<±5>` percentage points of the evidenced reference, or the variance is explained and accepted. | ❌ | |
| A-07 | The integration of feature test repo and genie framework is documented and repeatable (not manual copy/paste). | ❌ | |
| A-08 | Runtime and environment specification is documented. | ❌ | |
| A-09 | Known-failing, known-flaky and data-dependent cases are listed and agreed. | ❌ | |
| A-10 | Incoming team can trigger a run independently, without assistance from the outgoing team. | ❌ | |
| A-11 | Named contacts and a `<N>`-week hypercare period are agreed in writing. | `<❌/✅>` | |

### 9.1 Baseline zero point

Once handover is accepted, the following becomes the agreed starting position, and the incoming team owns the suite's quality from that date forward. Defects and failures recorded before this point are attributable to the transition, not to the incoming team.

| Field | Value |
|---|---|
| Acceptance date | `<YYYY-MM-DD>` |
| Accepted version | `<commit hash / tag>` |
| Accepted pass rate | `<%>` (`<n>` of `<n>` cases) |
| Documented exceptions carried over | `<n>` — see section 9.2 |
| Accepted by | `<Name>` / `<Name>` |

### 9.2 Accept-as-is exceptions

If schedule pressure requires acceptance before all criteria are met, record it explicitly as **conditional acceptance with documented exceptions**. Acceptance of a known defect is not the same as ownership of an unknown one.

| # | Exception | Criterion waived | Agreed remediation owner | Target date | Agreed by | Date |
|---|---|---|---|---|---|---|
| E-01 | `<description>` | `<A-0x>` | `<name>` | `<date>` | `<name>` | `<date>` |

---

## 10. Risk register

| ID | Risk | Likelihood | Impact | Rating | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|---|
| R-01 | Suite cannot be built due to unavailable private dependencies; automated regression coverage is unavailable from the transition date. | High | High | 🔴 | Escalate REQ-03 to `<delivery managers>`; in parallel, scope manual regression fallback and its cost. | `<Name>` | Open |
| R-02 | No verified baseline exists, so post-transition quality cannot be attributed between delivered defects and incoming team changes. | High | High | 🔴 | REQ-01; establish and publish the incoming team's own measured baseline (section 8). | `<Name>` | Open |
| R-03 | Unbounded diagnostic effort displaces planned `<project>` work. | High | Medium | 🟠 | Time-box investigation to `<N>` person-days; report exhaustion of the budget to `<manager>` as a decision point. | `<Name>` | Open |
| R-04 | Non-deterministic, market-data-dependent tests make results unreliable as a release gate. | High | Medium | 🟠 | Quantify non-determinism across 3 runs; propose test data isolation / mocking as remediation work with its own estimate. | `<Name>` | Open |
| R-05 | Manual integration of two repositories introduces defects and is not reproducible. | Medium | High | 🟠 | REQ-05; define a proper integration/build process as a prerequisite to acceptance. | `<Name>` | Open |
| R-06 | Outgoing team members become unavailable (roll-off / reassignment) before gaps are closed. | `<Medium>` | High | 🔴 | Confirm roll-off dates; prioritise REQ-01 to REQ-03 before that date; capture everything in writing now. | `<Name>` | Open |
| R-07 | Genesis access is never granted, leaving no route to reproduce the original execution environment. | Medium | High | 🟠 | Decision required: pursue access, or fund a rebuild of local execution capability. | `<Name>` | Open |

---

## 11. Decisions required

| # | Decision needed | Options | Recommendation | Decision owner | Needed by | Outcome |
|---|---|---|---|---|---|---|
| DEC-01 | How are the private dependencies to be obtained? | (a) Outgoing team provides them; (b) escalate as a scope/contract matter; (c) incoming team rebuilds or replaces them — `<estimate>` | (a), escalating to (b) if unresolved by `<date>` | `<Name>` | `<date>` | `<Pending>` |
| DEC-02 | Is read-only Genesis access to be pursued? | (a) Pursue; (b) accept permanent loss of run history and reporting | (a) | `<Name>` | `<date>` | `<Pending>` |
| DEC-03 | What happens if handover acceptance criteria are not met by `<date>`? | (a) Extend transition; (b) conditional acceptance with documented exceptions; (c) manual regression fallback | (b) with a firm remediation plan | `<Name>` | `<date>` | `<Pending>` |
| DEC-04 | How much effort is authorised for remediating the delivered suite? | `<N>` person-days | Time-box and review at `<date>` | `<Name>` | `<date>` | `<Pending>` |

---

## 12. Appendix

### 12.1 Delivered artefact register

Keep every received artefact unmodified, alongside its checksum and provenance.

| # | Artefact | Received date | Received from | Channel | SHA-256 | Stored at | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `<feature-test-repo-drop1.zip>` | `<YYYY-MM-DD>` | `<Name>` | `<Email>` | `<hash>` | `<location>` | Not current version; not deployable |
| 2 | `<feature-test-repo-drop2.zip>` | `<YYYY-MM-DD>` | `<Name>` | `<Email>` | `<hash>` | `<location>` | Subset of cases non-executable |
| 3 | `<genie-framework.zip>` | `<YYYY-MM-DD>` | `<Name>` | `<Email>` | `<hash>` | `<location>` | |

### 12.2 Evidence index

| Ref | Description | Link |
|---|---|---|
| EV-01 | Deployment failure log, first drop | `<link>` |
| EV-02 | Dependency resolution error output | `<link>` |
| EV-03 | Email thread — private dependency request and response | `<link>` |
| EV-04 | Email thread — baseline run request and response | `<link>` |
| EV-05 | Local run artefacts, runs 1–3 | `<link>` |

### 12.3 Page change history

| Date | Author | Change |
|---|---|---|
| `<YYYY-MM-DD>` | `<Name>` | Page created |
