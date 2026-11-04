# Upload original project sources and supporting files

The repository is initialized with README, license, security policy, safe environment template, and automated validation. The GitHub connector cannot automatically stream a local archive's 50+ separate source and Word/binary assets into the repository.

To complete the source upload:

1. Download `Smart-Budgeting-OCR-Portfolio-Upload.zip` from this conversation.
2. Install GitHub Desktop, and clone `https://github.com/azaanmalik/smart-budgeting-ocr-system.git`.
3. Extract the **contents** of the ZIP into your cloned repository's root directory, preserving `backend/`, `frontend/`, `docs/`, `database/`, `samples/` and `scripts/`. Do not add a wrapper folder.
4. In GitHub Desktop review changed files. Confirm there are **no** `node_modules/`, nested `.git/`, `receipts_storage/`, `.env`, database backups, caches or build outputs.
5. Commit with message `feat: add complete budget and OCR project source and documents` and push to origin.
6. On GitHub check the most recent Actions run and confirm the root README's file links work.

The original ZIP contains 48,106 entries, but most are installed dependencies, build artifacts, or Git metadata. The public upload package retains meaningful application source and reference documents, excluding unsafe private dump data.

Any original development credentials embedded in your local copies must be rotated independently, regardless of whether this public version omits them.
