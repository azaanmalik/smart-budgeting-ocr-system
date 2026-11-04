# PostgreSQL database

The backend SQLAlchemy models in `backend/app/models.py` define tables for users, categories, receipts, expenses, budgets and alerts. On first startup `Base.metadata.create_all(bind=engine)` creates missing tables on the configured development database.

The original ZIP also contains `Database/ERD_OCR.pgerd`, a PostgreSQL ERD definition, which is kept here as `ERD_OCR.pgerd`.

**Privacy protection:** The archive's two files named `budgeting_system.backup` and `budgeting_system.sql` are both PostgreSQL **custom-format binary dumps** (magic `PGDMP`), not plain SQL. The archive includes table-data sections. These dumps are intentionally **not** published in a public repository, because they may contain private account information, expenses and password hashes.

To create a safe schema-only export from a local database you control:

```bash
pg_dump --schema-only --no-owner --no-privileges --file=schema.sql --dbname="$DATABASE_URL"
```

Review it before committing. To restore a custom-format private backup to your own local database, use `pg_restore` with suitable safety precautions; never use an untrusted dump in a production database.
