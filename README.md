# FuelEU — Prototype

A small prototype implementing FuelEU compliance, banking and pooling workflows. The project is split into a backend (Node + TypeScript + Prisma) and a frontend (React + TypeScript + Vite). This repo was built interactively using an automated coding assistant and manual edits.

## Overview

FuelEU is a demonstration app that models route-level emissions intensity, computes compliance balances (CB), allows ships to bank surplus credits, and to form pools to share surplus credits among members. The app provides:

- Compliance computations (per-route/ship CB)
- Banking: bank CBs (store surplus) and apply them to deficits
- Pooling: redistribute surplus across a set of ships to cover deficits
- A UI with tabs for Routes, Compliance, Banking, Pooling and Compare

## Architecture summary (hexagonal)

This repository follows a hexagonal (ports & adapters) architecture. Key layers:

- Core (domain + application): business logic lives here (ComplianceService, PoolService, BankService, domain entities like Route, ComplianceEntity, PoolEntity).
- Adapters - Inbound (HTTP controllers): express controllers that map HTTP requests to application services and DTOs.
- Adapters - Outbound (Postgres/Prisma repos): repository implementations that use Prisma to persist domain entities.
- Infrastructure: Prisma client and DB seed script.
- Frontend: React + TypeScript UI that calls backend HTTP endpoints via a small API client.

Why hexagonal?

- Keeps domain logic independent from transport and persistence details.
- Makes testing and future integrations (CLI, other APIs) easier by swapping adapters.

## Setup & run instructions

Prerequisites:

- Node.js (16+ recommended) and npm
- A local Postgres instance or use SQLite (adjust `prisma/schema.prisma` datasource)

Backend (from `/Backend`)

```bash
# install
npm install

# generate prisma client and push schema
npx prisma generate
npx prisma db push

# seed sample data
npx ts-node src/infrastructure/db/seed.ts

# start dev server
npm run dev
```

Frontend (from `/frontend`)

```bash
npm install
npm run dev
```

Environment

- Frontend expects `VITE_API_URL` pointing to the backend (default is `http://localhost:8000`; set it to `http://localhost:3000` for the included backend).

## How to execute tests

This prototype includes domain code but does not yet include a full test suite. Recommended commands to add and run tests:

1. Install Jest/Vitest in both backend and frontend packages (or use the project's preferred test runner).
2. Add unit tests for `PoolEntity.allocate` and `BankService.applyBank` covering happy and failure paths.

Example (planned):

```bash
# from Backend:
npm run test

# from frontend:
npm run test
```

If you want, I can add a basic Jest setup and a couple of unit tests (PoolEntity.allocate and BankService.applyBank) — say the word and I'll implement them.

## Sample requests and responses

1) Get compliance balances (mapped to frontend DTO)

Request:

GET /compliance/cb?year=2024

Response (200):

```json
{
	"success": true,
	"data": [
		{ "shipId": "R001", "year": 2024, "cbBefore": 1234.56, "cbAfter": null },
		{ "shipId": "R002", "year": 2024, "cbBefore": -4321.00, "cbAfter": null }
	]
}
```

2) Get adjusted CB (after banking)

Request:

GET /compliance/adjusted-cb?year=2024

Response (200):

```json
{
	"success": true,
	"data": [
		{ "shipId": "R001", "year": 2024, "cbBefore": 1500.0 },
		{ "shipId": "R002", "year": 2024, "cbBefore": -200.0 }
	]
}
```

3) Bank credits for a ship

Request:

POST /banking/bank
Content-Type: application/json

Body:

```json
{ "shipId": "R001", "year": 2024, "amount": 500 }
```

Response (200):

```json
{ "success": true, "message": "Banked successfully" }
```

4) Apply banked credits to a deficit ship

Request:

POST /banking/apply
Content-Type: application/json

Body:

```json
{ "shipId": "R002", "year": 2024, "amount": 200 }
```

Response (200):

```json
{ "success": true, "message": "Applied successfully" }
```

5) Create a pool

Request:

POST /pools
Content-Type: application/json

Body (array of ship ids accepted):

```json
{ "year": 2024, "members": ["R001", "R002", "R003"] }
```

Response (200):

```json
{ "success": true, "data": { "poolId": "<uuid>", "members": [ { "ship_id": "R001", "cb_before": 1000, "cb_after": 500 }, ... ] } }
```

## Screenshots

Screenshots are not included in the repo, but the UI has tabs for Routes, Compliance, Banking, Pooling and Compare. Each tab fetches from the backend and shows simple tables and action buttons.

If you want, I can add a small `docs/screenshots` folder with a few annotated screenshots captured from the running app.

---

If you'd like me to add tests, standardize DTOs, or generate a PR summary listing all code changes, tell me which item to tackle next and I'll implement it.
