# PS LTS Redesign Brief

## Goal

Build a separate online-first web app for multi-user logistics master-data CRUD. Keep the original Excel app as legacy reference and offline fallback.

## Initial architecture

```text
React UI → Flask JSON API → PostgreSQL
                         ↓
                      audit log
```

- React replaces current server-rendered templates.
- Flask remains first backend target; FastAPI and Django are later evaluations.
- Python API enforces validation, permissions, uniqueness, soft-delete, and audit.
- PostgreSQL runs locally during development; Supabase Free is the online candidate.
- SQLAlchemy handles DB access; Alembic tracks migrations.
- Android/Kotlin client is KIV and should reuse the API later.

## MVP

- Dashboard shell
- CRUD for drivers, delivery sites, suppliers, and clients
- Email/password login, validation, and reset
- `Admin` and `Editor` roles
- Soft delete with same-day self-restore; admin restore after cutoff
- Audit history
- Search, sort, filter, bulk actions, and stale-edit detection
- Excel import/export for admins

## First vertical slice

1. React mock shell.
2. Drivers CRUD UI with fake data.
3. Flask Drivers API.
4. PostgreSQL schema and migrations.
5. Connect UI to API.
