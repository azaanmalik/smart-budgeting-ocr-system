# Smart Budgeting & OCR Receipt Management System

[![Repository checks](https://github.com/azaanmalik/smart-budgeting-ocr-system/actions/workflows/validate.yml/badge.svg)](https://github.com/azaanmalik/smart-budgeting-ocr-system/actions/workflows/validate.yml)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![OCR](https://img.shields.io/badge/OCR-Tesseract-3A7F69)

A full-stack personal finance prototype for tracking expenses, maintaining category-based budgets, analyzing spending, and extracting receipt details with optical character recognition (OCR).

> **Status:** Portfolio source project. It is not deployed or verified as a production financial service. The supplied archive has been reorganized to remove generated dependencies, local Git history, caches, and credentials. Original documents are preserved separately from application source code.

## Features

- User registration, login, and JWT-authenticated access
- Receipt image upload, OCR extraction, and review/editing of detected data
- Expense tracking, categories, filtering, and CSV export
- Monthly category budgets and threshold alerts
- Visual dashboard and spending breakdowns
- Account profile and password management

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router, Axios, Recharts, React Icons |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic |
| Authentication | JWT, password hashing through Passlib |
| Database | PostgreSQL |
| OCR | Tesseract OCR through pytesseract and Pillow |

## Architecture

```text
React SPA (frontend/)
     |
     | HTTP + bearer token
     v
FastAPI (backend/app/)
     |                  \
     | SQLAlchemy        \ Pillow + Tesseract
     v                    v
PostgreSQL             Receipt text and fields
     ^
     |
Expense / Budget / Receipt / Category / Alert models
```

## Repository layout

```text
smart-budgeting-ocr-system/
├── .github/workflows/validate.yml   # Lightweight static checks
├── backend/
│   ├── app/                         # FastAPI models, routers and services
│   ├── .env.example                 # Environment variable template
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/                         # React pages/components
│   ├── package.json
│   └── package-lock.json
├── database/
│   ├── ERD_OCR.pgerd                # Original PostgreSQL ERD
│   └── README.md                    # Database notes
├── docs/
│   ├── dissertation/                # Original Word report
│   ├── manuals/                     # Original user manuals
│   └── plans/                       # OCR project plan
├── samples/
│   └── receipt.jpg                  # Sample receipt
├── scripts/validate_repository.py
├── LICENSE
├── SECURITY.md
└── README.md
```

## Local setup

**Prerequisites:** Python 3.10+, Node.js (compatible with the provided React lockfile), PostgreSQL, and the Tesseract OCR executable installed and available on your system PATH.

### Backend

```bash
cd backend
python -m venv .venv
# Windows PowerShell: .venv\Scripts\Activate.ps1
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # On Windows use: copy .env.example .env
```

Set `DATABASE_URL` to an accessible **empty development PostgreSQL database**, and `SECRET_KEY` to a fresh random secret (for example, `python -c "import secrets; print(secrets.token_urlsafe(48))"`). The app uses SQLAlchemy models to create tables at startup. Do not copy any real user data into the demo repository.

```bash
uvicorn app.main:app --reload
```

API root: `http://127.0.0.1:8000/` | API docs: `http://127.0.0.1:8000/docs`

### Frontend

Open a second terminal:

```bash
cd frontend
npm ci
# Optional: put REACT_APP_API_BASE_URL=http://127.0.0.1:8000 in frontend/.env.local
npm start
```

Then open `http://localhost:3000`.

### OCR workflow

1. Create an account and sign in.
2. Open Upload Receipt and choose a supported image.
3. The backend stores the receipt in a local ignored directory, applies OCR, and attempts to extract title, total and date.
4. Confirm/edit the extracted fields and category. OCR extraction may be imperfect.
5. View history and expense dashboards.

## Data and document handling

- **No live database dump or account data is published.** The provided `Database/budgeting_system.backup` and `budgeting_system.sql` are PostgreSQL custom-format dumps, not ordinary SQL scripts. They are omitted from the public package because they can contain real user rows and password hashes. See [database notes](database/README.md).
- `receipts_storage/` is ignored because receipt scans may be sensitive; the included `samples/receipt.jpg` is a standalone synthetic/demo-style receipt from the provided archive.
- The original dissertation and project manuals are supplied as reference documents. They may include contributor or institutional information; check reuse permission before public posting.

## Validation and limitations

Run `python scripts/validate_repository.py`. GitHub Actions performs static Python validation, basic source-layout and secret-pattern checks, and optional frontend build when the actual source is present. A green check is **not** an end-to-end PostgreSQL/OCR/browser test.

Security hardening is documented in [SECURITY.md](SECURITY.md). This prototype is not investment advice, banking software, or a production data custodian.

## License

See [LICENSE](LICENSE) for the MIT license covering **original code where contributors own the rights to license it**. The original academic documents, example assets, third-party dependencies and datasets are not automatically licensed by that file.
