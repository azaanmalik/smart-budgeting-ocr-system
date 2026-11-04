# Public portfolio security review

Security improvements compared to supplied archive:

1. PostgreSQL URL with embedded password removed. `DATABASE_URL` is required from environment or `backend/.env`.
2. JWT signing key no longer has a default; 32+ character value required.
3. Uploaded receipt files get randomized names to avoid overwrite/cross-user collision.
4. Image uploads are limited to 8 MiB and validated with Pillow before OCR.
5. Receipt file downloads now require authentication and ownership using the receipt ID.
6. React receipt previews load through authenticated Axios requests with blob URLs.
7. Server-side receipt images are removed when their database receipt is deleted.
8. PostgreSQL custom-format data dumps are excluded from the public package; no real customer data is knowingly published.

**Further work before production:** apply a rate limit for login/OCR, consider HttpOnly refresh token cookies instead of localStorage, CSP, audit logs, Alembic migrations, input validations, storage/DB transactions consistency, and cross-user integration tests.

**Deployment testing:** No live database, browser, or Tesseract end-to-end run was possible here. All Python sources were statically parsed. Verify the full workflow locally before production use.
