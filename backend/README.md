# Water Billing Backend (TypeScript + Express + PostgreSQL)

Backend APIs for auth, upload/process/download Excel, with PostgreSQL persistence.

## 1. Setup PostgreSQL

Option A (Docker):
```bash
docker compose up -d
```

Option B (Local PostgreSQL):
- Create DB: `water_billing`
- Set `DATABASE_URL` in `.env`

## 2. App setup

```bash
npm install
cp .env.example .env
npm run db:init
npm run dev
```

Server: `http://localhost:4000`

## Environment

`.env` keys:
- `PORT`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CORS_ORIGIN`
- `DATABASE_URL`

## API Endpoints

### Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/forgot-password`

### Files (JWT required)
- `POST /upload` (multipart/form-data, field: `file`, accepts `.xlsx`)
- `POST /process`
- `GET /summary/:fileId`
- `GET /download/:fileId`

Use header:
```http
Authorization: Bearer <token>
```

## Request/Response Contracts

### `POST /auth/register`
Request:
```json
{ "gmail": "user@gmail.com", "confirmGmail": "user@gmail.com" }
```
Response:
```json
{ "message": "Your password has been sent to your Gmail", "devPassword": "..." }
```

### `POST /auth/login`
Request:
```json
{ "gmail": "user@gmail.com", "password": "..." }
```
Response:
```json
{ "token": "...", "user": { "id": "...", "gmail": "user@gmail.com" } }
```

### `POST /auth/forgot-password`
Request:
```json
{ "gmail": "user@gmail.com" }
```
Response:
```json
{ "message": "Your password has been sent to your Gmail", "devPassword": "..." }
```

### `POST /upload`
Response:
```json
{ "fileId": "...", "fileName": "input.xlsx", "message": "File uploaded successfully" }
```

### `POST /process`
Request:
```json
{ "fileId": "...", "costPerUnit": 18.5, "fixedMaintenanceCharge": 250 }
```
Response:
```json
{
  "fileId": "processed-file-id",
  "rows": [],
  "summary": {
    "totalCauveryUnits": 0,
    "totalTankerUnits": 0,
    "totalBorewellUnits": 0,
    "totalUnits": 0,
    "cauveryCost": 0,
    "tankerCost": 0,
    "borewellCost": 0,
    "operationCharges": 0,
    "fixedMaintenance": 0,
    "totalAmount": 0
  },
  "downloadUrl": "/download/processed-file-id"
}
```

### `GET /summary/:fileId`
Response:
```json
{ "fileId": "...", "summary": {}, "rows": [] }
```

### `GET /download/:fileId`
Downloads fully formatted `.xlsx`.

## Database Tables

Created by `npm run db:init` from `db/schema.sql`:
- `users`
- `uploads`
- `processed_files`

## Excel Output Rules Implemented

- `Billing Data` sheet with styled headers, proper column order, right/left alignment, borders, freeze row, auto column width, 2-decimal unit columns, INR currency columns.
- `Summary` sheet with units + cost sections, spacing, bold metrics, INR formatting.
