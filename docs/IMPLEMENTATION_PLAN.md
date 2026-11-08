# PSLTS Redesign Implementation Plan

## Current state

Scaffold only. Legacy project remains untouched.

## Approved Phase 2 design decisions

- `MasterDataPage` is the shared page structure for Drivers, Delivery Sites, Suppliers, and Clients.
- `DataTable` is shared; no separate `DriverTable`, `SiteTable`, `SupplierTable`, or `ClientTable` initially.
- Add/edit uses a right-side drawer; the table remains visible.
- Delete uses a confirmation dialog.
- `SummaryCardRow` remains reusable but renders one total-count card initially.
- Summary counts come from mock record counts; status and compliance metrics are deferred.
- Resource config supplies verified Excel-derived columns, labels, field types, and business IDs.
- Mock service boundary comes before Flask/API work.
- Mobile drawer behavior is deferred (KIV) for a later phase.
- Database validation, status derivation, permissions, and soft-delete cutoff rules remain deferred to the database/API phase.
- Money values use decimal-safe boundaries: frontend/API represent input as strings, backend uses `Decimal`, and PostgreSQL later uses `NUMERIC(12,2)`; values with more than two decimal places are rejected.

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

## Phase 2 — Shared master-data mock UX

Deliverable: shared mock CRUD experience, with Drivers as the first working vertical slice.

Scope:

- verified resource schemas from the legacy Excel workbooks
- `MasterDataPage`
- `SummaryCardRow` with one total-count card
- shared `DataTable`
- shared add/edit drawer and form
- shared delete confirmation
- mock data service boundary
- Drivers first, then Delivery Sites, Suppliers, and Clients
- desktop drawer only; mobile drawer deferred

Verify: all four sections use the same CRUD structure and mock service; UX review before API work.

## Phase 2A — Frontend field validation

Status: verified; lint/build pass; manual drawer checks passed.

Manual verification result:

- required-field errors blocked invalid add/edit saves
- `12.5` and `12.50` accepted; `12.499` rejected
- valid records saved and appeared in the table
- delete/restore behavior remained unchanged
- all four master-data pages checked

Scope:

- required fields per resource
- numeric-only phone input
- MYR money fields displayed and checked to two decimal places
- represent money input as strings at frontend/API boundaries; reject more than two decimal places
- inline drawer validation messages
- keep uncertain Commission, Road Tax, and Inspection fields as strings
- no database or API validation yet

Files/actions:

- update `frontend/src/config/masterDataConfig.js` with validation metadata
- update `frontend/src/components/master-data/MasterDataDrawer.jsx` with validation and error display
- add focused frontend tests if test tooling exists; otherwise record manual checks

Test plan:

- empty required fields block save
- invalid phone input blocks save
- invalid money input blocks save
- valid add saves record
- valid edit updates record
- delete, restore, and cancel remain unchanged

Verification:

- run `npm.cmd run lint`
- run `npm.cmd run build`
- manually test add/edit for all four resources
- confirm errors appear beside affected fields and clear after correction

Success criteria: invalid records cannot save; valid records save; money values accept up to two decimal places without frontend floating-point conversion; existing CRUD behavior remains unchanged.

Risks/tradeoffs: validation rules may change after database design; uncertain fields stay intentionally permissive; decimal normalization remains a backend/DB responsibility.

## Phase 3 — Flask API contract

Deliverable: clean Flask JSON API for Drivers.

Status: implemented; Astra review passed; 15 backend tests pass; manual API-client check remains.

Scope:

- versioned REST routes
- request/response schemas
- consistent errors
- server-side search/sort/pagination
- business-ID uniqueness rules

Verify: API tests cover success, invalid input, duplicates, missing records, and pagination.

Technical design:

- Create a new Flask backend in this repository; leave the legacy Flask project untouched.
- Use an app factory so tests can create isolated Flask app instances.
- Use `/api/v1/` route prefix from the first endpoint.
- Return JSON only; keep response shapes stable for the React client.
- Keep route handlers thin: routes translate HTTP, schemas validate data, repositories store data.
- Use an in-memory repository in Phase 3; PostgreSQL starts in Phase 4.
- Use `201 Created` for successful create, `200 OK` for reads/updates/restores, and consistent `4xx` JSON errors.
- Keep authentication and permissions deferred to Phase 7.
- Keep React mock service active until the API contract is approved and connected in Phase 5.

Backend file structure:

```text
backend/
├─ app/
│  ├─ __init__.py
│  ├─ errors.py
│  └─ routes/
│     ├─ __init__.py
│     └─ drivers.py
├─ schemas/
│  ├─ __init__.py
│  └─ drivers.py
├─ repositories/
│  ├─ __init__.py
│  └─ drivers.py
├─ tests/
│  ├─ conftest.py
│  └─ test_drivers_api.py
├─ requirements.txt
└─ run.py
```

Phase 3 does not copy legacy Flask files. It ports verified behavior and field definitions into this structure.

## Phase 4 — Local PostgreSQL foundation

Deliverable: repeatable local database setup.

Status: DB verification deferred; Astra review passed; compile and 15 backend tests pass.

Scope:

- existing local PostgreSQL server
- SQLAlchemy models
- Alembic migrations
- money columns as PostgreSQL `NUMERIC(12,2)`; no integer-cents conversion
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
- verified field mappings
- entity-specific resource configuration
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

Action: define verified Excel-derived schemas; add mock data/service boundary; build `SummaryCardRow`, `SummaryCard`, `DataTable`, `MasterDataPage`, add/edit drawer/form, and delete confirmation. Connect Drivers first, then the remaining three resources.

Test: schema/config checks; render each resource; total-count card; search; add; edit; delete; restore; cancel; empty state; resource isolation.

Verify: all four sections use shared CRUD components and mock services; one total card renders per section; desktop drawer UX approved. Mobile drawer behavior remains deferred.

### Phase 3

Action: create Flask app, versioned routes, schemas, error format, and in-memory/test repository.

Test: API tests for list, search, sort, pagination, create, update, duplicate, missing record, soft-delete, restore.

Verify: API contract matches frontend needs; tests run without PostgreSQL.

### Phase 4

Action: verify local PostgreSQL; add SQLAlchemy models, Alembic migrations, constraints, timestamps, UUIDs, and versions.

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

- Files: `frontend/src/config/masterDataConfig.js`, `frontend/src/data/masterData.js`, `frontend/src/services/masterDataService.js`, `frontend/src/components/master-data/`, and resource wiring in `frontend/src/App.jsx`.
- Action: define verified schemas; build shared total card, table, page, drawer/form, delete dialog, and mock service; connect Drivers first, then Sites, Suppliers, and Clients.
- Commands: `npm run build`, `npm run lint`; component test command after test tooling is added.
- Automated tests: schema headers, total count, resource rendering, search, add, edit, delete, restore, cancel, empty state, and resource isolation.
- Manual verification: table remains visible behind drawer; drawer open/close; confirmation behavior; desktop width; no mobile drawer work in this phase.
- Go gate: all four resources use shared CRUD structure; UX approved before Flask/API payloads are frozen.

### Phase 2A — Runbook

- Files: `frontend/src/config/masterDataConfig.js`, `frontend/src/components/master-data/MasterDataDrawer.jsx`, and frontend tests if available.
- Action: add config-driven required/type rules; validate before mock-service save; render field-level errors.
- Automated tests: required fields, phone digits, up-to-two-decimal money, rejection of more than two decimals, valid add, valid edit, and unchanged delete/restore.
- Manual verification: test each resource drawer; correct invalid values; confirm errors clear; confirm valid records save.
- Go gate: validation works consistently across all four resources; no API/DB work included.

### Phase 3 — Runbook

- Files: `backend/app/`, route modules, schemas, repository interface, `backend/tests/`.
- Action: create Flask app factory, versioned Drivers routes, schemas, error handler, in-memory test repository.
- Commands: `python -m pytest`, Flask local run command.
- Automated tests: status codes, response shapes, duplicate conflict, invalid fields, missing record, search, sort allowlist, pagination, soft-delete, restore.
- Manual verification: inspect JSON with API client; compare payloads with React fake data.
- Go gate: API contract matches frontend exactly; tests do not require PostgreSQL.

### Phase 4 — Runbook

- Files: `backend/models/`, `backend/migrations/`, `backend/config.py`, `backend/.env.example`.
- Action: verify local PostgreSQL; add SQLAlchemy models; create Alembic revisions; add constraints/indexes.
- Commands:
  - create local database `pslts` using pgAdmin or `createdb pslts`
  - from PowerShell, set `$env:DATABASE_URL = 'postgresql+psycopg://USER:PASSWORD@localhost:5432/pslts'`
  - note: `.env.example` documents the variable; it is not loaded automatically
  - from `backend/`, run `alembic upgrade head`
  - run `py -m pytest`
  - rollback with `alembic downgrade -1`, then rerun `alembic upgrade head`
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
