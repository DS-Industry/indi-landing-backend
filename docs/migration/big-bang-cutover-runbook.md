# Big-Bang Cutover Runbook (Oracle -> Postgres)

## 1) Pre-cutover checklist

- Postgres schema is created and validated against `docs/migration/schema-contract-audit.md`.
- Backend branch includes Postgres TypeORM config.
- `DB_FEATURE_STUB_TRANSACTIONS=true` is set for first release.
- Migration script is tested in dry-run mode.
- Rollback env for Oracle is prepared.

## 2) Dry-run migration

Run without writes to verify connectivity and row traversal:

```bash
MIGRATION_DRY_RUN=true npm run migration:postgres
```

Expected:

- no SQL errors
- `.report.json` created with processed counters

## 3) Maintenance window start

- Freeze writes to legacy application (maintenance mode or API write lock).
- Confirm no active background jobs writing into Oracle.

## 4) Final migration pass

```bash
MIGRATION_DRY_RUN=false npm run migration:postgres
```

Validate:

- `failed=0` for all tables or known/retriable subset only
- checkpoint file reaches end for all tables

## 5) Switch application to Postgres

- Set target env variables (`DB_HOST/DB_PORT/DB_USERNAME/DB_PASSWORD/DB_DATABASE`).
- Keep `DB_FEATURE_STUB_TRANSACTIONS=true` for first launch.
- Deploy and restart service.

## 6) Smoke tests

Execute critical scenarios in order:

1. auth/login by phone
2. profile read/update
3. card lookup (`devNomer` and `nomer`)
4. OTP create/find/delete flow
5. subscription create/read/update
6. pack apply/check
7. invited code create/check/apply

## 7) Post-cutover observation (24-48h)

- Monitor API errors, DB errors, and latency.
- Track calls affected by temporary transaction stubs.
- Collect table-level diff samples against legacy snapshots.

## 8) Rollback plan

If severe regression appears:

1. stop app
2. switch env back to Oracle
3. redeploy previous stable build
4. keep Postgres data for forensic diff only

## 9) Exit criteria

- smoke tests green
- no P1/P2 incidents in observation window
- migration report archived
- rollback no longer required
