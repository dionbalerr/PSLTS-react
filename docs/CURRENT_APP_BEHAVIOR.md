# PS LTS — Current Behavior Baseline

This document records the legacy app before redesign.

## Purpose

PS LTS is a small internal logistics master-data app. One operator maintains records for business use.

## User flow

1. Open Home.
2. Open Maintenance.
3. Choose Drivers, Delivery Sites, Suppliers, or Clients.
4. Open the selected listing.
5. View, add, edit, delete, refresh, or go back.

The legacy app uses Flask routes, server-rendered Jinja templates, URL flags, HTML forms, and modal status flags.

## Data storage

- Original source of truth: local Excel workbooks under `data/`.
- One workbook per master-data area.
- pandas reads and writes workbook data.
- First column acts as unique record identity.
- Add rejects duplicate identities.
- Edit preserves identity uniqueness.
- Delete removes selected rows in the current implementation path.

## Entities

- Drivers — business ID `DRIVER_NO`
- Delivery sites — business ID `SITE_NO`
- Suppliers — business ID `SUPPLIER_NO`
- Clients — business ID `CLIENT_NO`

## Firebase status

Firestore is an experimental work-in-progress path, not the original Excel replacement. It initializes only when `serviceAccount.json` exists and has helper functions for selected collections.

## Current boundaries

- No login or authentication.
- No user roles or permissions.
- No multi-user audit history.
- No established database source of truth.
- Excel remains the original persistence path.

## Known uncertainty

The legacy documentation says delete previously did not work, while current route and template code contains a delete flow. End-to-end selected-row deletion needs runtime verification before the redesign treats it as a guaranteed behavior.

## Redesign boundary

The new app will preserve valid business behavior while replacing the legacy template/route structure. Future login, roles, PostgreSQL, audit, dashboard, and Excel import/export are redesign requirements, not current behavior.
