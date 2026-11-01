# PSLTS Redesign Implementation Plan

## Current state

Scaffold only. Legacy project remains untouched.

## Phase 0 — Confirm baseline

Deliverable: agreed behavior and redesign docs.

Verify:

- `CURRENT_APP_BEHAVIOR.md` describes the legacy app.
- `REDESIGN_BRIEF.md` describes target behavior.
- No source code changed in legacy project.

Gate: stop if a planned feature conflicts with current business behavior.

## Phase 1 — React shell

Deliverable: runnable React app with Stitch-inspired layout.

Scope:

- sidebar navigation
- dashboard placeholder
- entity navigation
- responsive desktop/tablet structure
- reusable shell components, not one monolithic `App.jsx`

Verify: app starts locally; navigation works with fake routes/state.

## Phase 2 — Drivers mock UX

Deliverable: complete Drivers CRUD experience using fake data.

Scope:

- table
- search, sort, filter
- add/edit side panel
- client-side validation feedback
- soft-delete confirmation
- Recently Deleted recovery view
- success/error toasts

Verify: all user flows work without backend; UX review before API work.

## Phase 3 — Flask API contract

Deliverable: clean Flask JSON API for Drivers.

Scope:

- versioned REST routes
- request/response schemas
- consistent errors
- server-side search/sort/pagination
- business-ID uniqueness rules

Verify: API tests cover success, invalid input, duplicates, missing records, and pagination.

## Phase 4 — Local PostgreSQL foundation

Deliverable: repeatable local database setup.

Scope:

- Docker PostgreSQL
- SQLAlchemy models
- Alembic migrations
- UUID/internal IDs
- business IDs and constraints
- timestamps and row versions

Verify: fresh database can be created from migrations; schema matches API needs.

## Phase 5 — Connect Drivers end to end

Deliverable: React Drivers UI backed by Flask + PostgreSQL.

Scope:

- replace fake data with API calls
- loading/empty/error states
- stale-edit detection
- transaction-safe CRUD

Verify: full Drivers workflow passes against a fresh local database.

## Phase 6 — Generalize master data

Deliverable: Sites, Suppliers, and Clients CRUD.

Scope:

- separate tables
- cleaned field names
- entity-specific forms
- shared table/form patterns

Verify: each entity supports the approved CRUD contract and validation.

## Phase 7 — Auth, permissions, deletion, audit

Deliverable: protected multi-user app.

Scope:

- email/password login, validation, reset
- `Admin` and `Editor` roles
- secure web session
- same-day deleting-user restore
- post-cutoff admin restore
- immutable audit records
- user management

Verify: every protected API route checks identity and role; audit entries match actions.

## Phase 8 — Dashboard

Deliverable: useful operational dashboard.

Initial scope:

- counts by entity
- recently added entries
- recent changes
- basic data-health indicators

Verify: dashboard reads real API data; no realtime dependency.

## Phase 9 — Excel migration and fallback

Deliverable: safe Excel import/export workflow.

Scope:

- admin upload
- preview and row-level validation
- duplicate handling
- import summary
- original-file retention
- export for offline fallback

Verify: test workbooks import without silent data loss.

## Phase 10 — Online deployment

Deliverable: online-first deployment proof of concept.

Scope:

- hosted PostgreSQL candidate
- backend hosting
- frontend hosting
- HTTPS and environment secrets
- backup and spend controls

Verify: deployed app passes smoke tests; local development remains reproducible.

## Deferred

- FastAPI evaluation
- Django evaluation
- Kotlin Android client
- Kotlin/Ktor backend
- automatic Excel/database synchronization
- realtime updates
- advanced analytics

## Action, test, and verification plan

Every phase follows: implement smallest slice → run focused tests → verify exit gate → review before next phase.

### Phase 0

Action: compare legacy behavior, redesign brief, and planned scope.

Test: document review; no runtime test.

Verify: decisions and non-goals are explicit; legacy source unchanged.

### Phase 1

Action: initialize React; build sidebar, routes/state, dashboard placeholder, entity navigation.

Test: build/lint; navigation smoke test at desktop and tablet widths.

Verify: app starts from a clean checkout; every planned nav item renders; no backend dependency.

### Phase 2

Action: add fake Drivers data, table, search/sort/filter, side-panel forms, delete/recovery, toasts.

Test: component tests for render, validation, add/edit/delete/restore, empty/error states.

Verify: complete Drivers workflow works with fake data; UX review approved.

### Phase 3

Action: create Flask app, versioned routes, schemas, error format, and in-memory/test repository.

Test: API tests for list, search, sort, pagination, create, update, duplicate, missing record, soft-delete, restore.

Verify: API contract matches frontend needs; tests run without PostgreSQL.

### Phase 4

Action: add Docker PostgreSQL, SQLAlchemy models, Alembic migrations, constraints, timestamps, UUIDs, versions.

Test: migration upgrade from empty DB; downgrade where supported; constraint tests; fresh database setup.

Verify: clean database reproduces schema exactly; no manual schema steps.

### Phase 5

Action: replace Drivers fake repository with PostgreSQL repository; connect React API client.

Test: backend integration tests against test DB; frontend API-mocking tests; end-to-end Drivers CRUD.

Verify: add/edit/delete/restore/search/pagination work across browser → Flask → PostgreSQL.

### Phase 6

Action: add site, supplier, and client models, API routes, forms, and tables using shared patterns.

Test: repeat entity contract tests; field validation; unique-ID constraints; representative end-to-end flow per entity.

Verify: all four entities work without copy-paste-specific regressions.

### Phase 7

Action: add login/reset, roles, protected routes, same-day restore, cutoff rules, audit writes, user admin.

Test: auth success/failure/reset; role matrix; authorization bypass attempts; delete/restore cutoff; audit completeness.

Verify: every protected action is server-enforced; no password/token secrets in logs or client storage; audit matches mutations.

### Phase 8

Action: add dashboard API queries and React widgets for counts, recent entries, changes, and data health.

Test: query correctness with seeded fixtures; empty/error states; permission visibility; load/performance sanity check.

Verify: metrics match database facts; manual refresh works; no realtime dependency.

### Phase 9

Action: add admin Excel upload, preview, mapping, validation, import summary, retention, and export.

Test: valid workbook, duplicate rows, malformed fields, missing columns, empty workbook, partial failure, re-import.

Verify: no silent data loss; rejected rows explain why; original file and summary retained.

### Phase 10

Action: deploy frontend/API/database candidate; configure HTTPS, environment secrets, backups, and spend controls.

Test: production smoke tests, login, CRUD, restore, audit, import/export, backup/restore rehearsal.

Verify: deployed app works from clean browser; secrets absent from repository; local setup remains reproducible; rollback path documented.

## Execution runbook

Each phase follows: action → automated test → manual verification → go/stop gate.

### Phase 0 — Runbook

- Files: `docs/CURRENT_APP_BEHAVIOR.md`, `docs/REDESIGN_BRIEF.md`.
- Action: compare legacy behavior against planned behavior.
- Test: document review only; no app execution.
- Manual verification: confirm scope, assumptions, non-goals, and legacy boundary.
- Go gate: proceed only when no business rule is silently changed.

### Phase 1 — Runbook

- Files: `frontend/package.json`, `frontend/src/`, `frontend/index.html`.
- Action: initialize React; extract `AppLayout`, `Sidebar`, `Topbar`, `MetricCard`, `Panel`, and `ActivityRow`; build dashboard placeholder and entity navigation.
- Commands: `npm install`, `npm run dev`, `npm run build`, `npm run lint`.
- Automated tests: shell renders; each nav route resolves; build passes.
- Manual verification: desktop/tablet layout, active nav, browser refresh, empty dashboard, reusable component boundaries.
- Go gate: shell approved; `App.jsx` remains orchestration only; no backend dependency.

### Phase 2 — Runbook

- Files: `frontend/src/features/drivers/`, shared table/form components, test fixtures.
- Action: build Drivers table and side-panel add/edit flow with fake data.
- Commands: `npm test`, `npm run build`, `npm run lint`.
- Automated tests: render, required ID, duplicate ID, add, edit, search, sort, filter, delete, restore, toast/error states.
- Manual verification: keyboard focus, cancel behavior, confirmation, Recently Deleted, empty/error states.
- Go gate: UX approved before API payloads are frozen.

### Phase 3 — Runbook

- Files: `backend/app/`, route modules, schemas, repository interface, `backend/tests/`.
- Action: create Flask app factory, versioned Drivers routes, schemas, error handler, in-memory test repository.
- Commands: `python -m pytest`, Flask local run command.
- Automated tests: status codes, response shapes, duplicate conflict, invalid fields, missing record, search, sort allowlist, pagination, soft-delete, restore.
- Manual verification: inspect JSON with API client; compare payloads with React fake data.
- Go gate: API contract matches frontend exactly; tests do not require PostgreSQL.

### Phase 4 — Runbook

- Files: `infra/docker-compose.yml`, `backend/models/`, `backend/migrations/`, DB config.
- Action: start PostgreSQL; add SQLAlchemy models; create Alembic revisions; add constraints/indexes.
- Commands: `docker compose up -d db`; migration upgrade; migration rollback/upgrade.
- Automated tests: empty-DB upgrade, downgrade where supported, unique ID, UUID, timestamps, version, nullable deletion.
- Manual verification: inspect tables, indexes, constraints, and connection settings.
- Go gate: fresh database reproduced from migrations only.

### Phase 5 — Runbook

- Files: `backend/repositories/`, `backend/services/`, `frontend/src/api/`, integration tests.
- Action: replace fake repository with PostgreSQL; connect React API client; add loading/error states.
- Commands: start DB, apply migrations, start Flask, start React, run backend/frontend/end-to-end tests.
- Automated tests: create/read/update/search/filter/delete/restore, stale-version rejection, rollback on failure.
- Manual verification: browser mutation, refresh persistence, network error, empty state.
- Go gate: browser → Flask → PostgreSQL Drivers workflow passes on fresh DB.

### Phase 6 — Runbook

- Files: entity models, schemas, routes, repositories, feature folders.
- Action: add sites, suppliers, clients one entity at a time using shared patterns.
- Commands: full backend tests, frontend tests, production build.
- Automated tests: contract matrix, unique IDs, null handling, numeric fields, legacy-name mapping.
- Manual verification: representative CRUD/restore flow per entity; search/filter/forms.
- Go gate: four entities behave consistently without entity-specific regressions.

### Phase 7 — Runbook

- Files: auth service, user model, session middleware, permission checks, audit service, security tests.
- Action: add invite/login/reset, roles, protected routes, cutoff restore, audit writes, user admin.
- Commands: backend tests, security tests, dependency audit command selected for project.
- Automated tests: wrong password, reset, disabled user, role bypass, CSRF/session behavior, cutoff, restore ownership, audit completeness.
- Manual verification: login/logout/reset; Editor/Admin UI; expired restore; audit filters; secret-free logs.
- Go gate: server rejects unauthorized requests even when UI controls are bypassed.

### Phase 8 — Runbook

- Files: dashboard query/service routes, dashboard React feature, fixtures.
- Action: add counts, recent entries, recent changes, data-health queries.
- Commands: backend tests, frontend tests, production build.
- Automated tests: count correctness, date ordering, role visibility, empty/error states.
- Manual verification: compare dashboard totals with tables; manual refresh; slow query behavior.
- Go gate: metrics match database facts; realtime not required.

### Phase 9 — Runbook

- Files: import/export service, mapping rules, upload UI, import tests, retention storage.
- Action: parse workbook, map names, preview, validate, commit accepted batch, retain source/summary.
- Commands: import fixture test suite; export comparison check.
- Automated tests: valid file, missing columns, malformed values, duplicate rows, repeated import, empty file, partial rejection.
- Manual verification: preview errors, approve/cancel, inspect summary, reopen export.
- Go gate: no silent partial import; rejected rows explain failure.

### Phase 10 — Runbook

- Files: deployment config, env templates, CI checks, operations docs.
- Action: deploy frontend/API/DB candidate; configure HTTPS, secrets, backups, spend alerts, health checks.
- Commands: CI build/test, deployment, smoke-test, rollback commands.
- Automated tests: build artifacts, migration check, health endpoint, protected API smoke tests.
- Manual verification: fresh-browser login, CRUD, restore, audit, import/export, backup/restore rehearsal.
- Go gate: deployed app works; secrets absent from Git; rollback documented.
