# Backend Assignment — File Upload & Excel Processing ✅

## Overview ✨

This project provides backend APIs to:

- Upload files (xls, xlsx, csv) and store them locally
- Process Excel/CSV files and persist valid records into a PostgreSQL database
- Retrieve stored records with pagination and optional filtering

This README documents project setup, API routes, validation rules, and sample requests you can use to verify the behaviour.

---

## Quick Setup 🚀

1. Clone & install

```bash
git clone https://github.com/Yuvraj-Singh-Rajawat/Butter-Money-Assignment.git
cd Butter-Money-Assignment
npm install
```

2. Environment variables (create `.env` or set in your environment):

- `PORT` (default 3000)
- `DATABASE_URL` (preferred, e.g. `postgresql://user:pass@host:5432/db?sslmode=require`) OR `HOST`, `USERNAME`, `PASSWORD`, `DATABASE`

3. Start the server

```bash
npm run dev
```

Health check: GET http://localhost:3000/health

---

## File storage

- Uploaded files are stored under `public/uploads` when using the file upload endpoint.
- A sample CSV template is available at `public/templates/sample.csv` for testing.

---

## API Endpoints 📚

Base url: `http://localhost:3000`

1. Upload File

- Endpoint: POST `/api/v1/files/upload`
- Description: Upload a single file and save to `public/uploads`.
- Rules:
  - Allowed extensions: `.xls`, `.xlsx`, `.csv`
  - Max file size: 5MB
- Request:
  - Content-Type: `multipart/form-data`
  - Field name: `file` (file to upload)

Success response (201):

```json
{
    "message": "File uploaded",
    "path": "/uploads/sample-1766082780975.csv",
    "url": "http://localhost:3000/uploads/sample-176605.csv"
}
```

Errors:

- 400 invalid file type: `{ "error": "Only xls, xlsx, and csv files are allowed!" }`
- 413 file too large: `{ "error": "File too large. Max size is 5MB" }`

---

2. Process Excel/CSV

- Endpoint: POST `/api/v1/files/process-excel`
- Description: Accepts an Excel/CSV file, validates rows, inserts valid rows into database, returns summary.
- Format expected (header row): `Id, Name, Age, Education` (case-insensitive headers supported)

Validation rules (per row):

- `Id`: required, integer, must be unique (duplicates in file or DB are skipped)
- `Name`: required, non-empty
- `Age`: required, positive number (>0)
- `Education`: required, non-empty


Sample success response (200):

```json
{
  "message": "Processing complete",
  "insertedCount": 3,
  "skipped": [
    { "row": 4, "errors": ["Age must be a positive number"] },
    { "row": 6, "errors": ["Duplicate id in file"] }
  ],
  "inserted": [{ "id": 9 }, { "id": 10 }, { "id": 16 }]
}
```

Notes:

- Invalid rows are skipped and logged (winston logger) with details.
- Validation is implemented using Zod for robust parsing and clear error messages.

---

3. Get All Records

- Endpoint: GET `/api/v1/files/getAll`
- Query params:
  - `page` (integer, default 1)
  - `limit` (integer, default 10, max 100)
  - `education` (optional filter value)

Example:

```
GET /api/v1/files/getAll?page=1&limit=10&education=Bachelor
```

Success response (200):

```json
{
  "page": 1,
  "limit": 10,
  "total": 42,
  "data": [{"id":1,"name":"John","age":25,"education":"Bachelor"}, ...]
}
```

Invalid query validation returns 400 with errors array.

---

## Database & Model 📦

- PostgreSQL (Sequelize) is used as the SQL DB.
- Model `User` / table `users`:
  - `id` INTEGER PRIMARY KEY UNIQUE NOT NULL
  - `name` STRING NOT NULL
  - `age` INTEGER NOT NULL
  - `education` STRING NOT NULL
- Sequelize `sync()` is used to create the table in development; in production prefer migrations.

---

## Error handling & Logging 🔍

- File type / size errors: JSON responses with appropriate status codes (400 or 413).
- Processing errors (parsing, DB insert failures) are logged and returned as `500` with a generic message.
- Validation failures per-row are included in the `skipped` array in the process response and also sent to the logger.

---
