# Security and privacy

This is a portfolio prototype handling potentially sensitive financial information. Do not use it to store real personal finances or sensitive receipts without a dedicated security assessment.

## Report a vulnerability

Do not disclose personal data, API tokens, or proof-of-concept exploits in public GitHub issues. Contact the repository maintainer privately using GitHub profile contact details or private vulnerability reporting where enabled.

## Security practices

- Configure `DATABASE_URL` and `SECRET_KEY` through private environment variables; never commit them.
- Replace any database passwords and JWT secrets used in earlier local development.
- Use a different database role for the application than the PostgreSQL superuser.
- Receipt uploads must enforce authentication, content validation and size limits. Receipt file downloads must be restricted to the original uploader.
- Serve production APIs over HTTPS, restrict CORS to trusted origins, use secure storage, log redaction and appropriate backup retention.
- Consider storing auth tokens in secure HTTP-only cookies rather than browser localStorage for production; the original prototype uses bearer tokens from localStorage.
- Test role isolation and object-level access checks with two independent users.
- Never commit a PostgreSQL dump with actual users, transaction records, password hashes or receipt data. Use a schema-only export if a database snapshot is needed.

## Repository changes

The upload package is derived from the supplied ZIP and removes a hardcoded PostgreSQL password default. The original code contains a public receipt-file route and reused filenames; the public package includes mitigation. These edits still require functional verification in a clean installation.
