# Migrate Backend from Python FastAPI to Node.js

The goal of this task is to completely convert the existing Python FastAPI backend into a Node.js backend while preserving all current functionality, including API routes, data persistence (JSON files), email dispatching, and business logic.

## User Review Required

> [!IMPORTANT]  
> We will be using **TypeScript** with **Express.js**. TypeScript is recommended over vanilla JavaScript because it provides type safety equivalent to the current Pydantic models used in the Python backend. For data validation, we will use **Zod**. For email dispatch, we will use **Nodemailer**.
> 
> Please confirm if you are okay with this tech stack (Node.js + Express + TypeScript + Zod + Nodemailer). 

## Open Questions

> [!WARNING]
> Do you want to keep the local JSON file storage (`data/leads.json` and `data/email_logs.json`) for persistence, or would you like to migrate to a real database (like PostgreSQL, MongoDB, or SQLite) during this conversion? (The current plan assumes keeping the JSON file storage to match exact current functionality).
>
> Is there a specific Node.js package manager you prefer (e.g., `npm`, `yarn`, or `pnpm`)? I will use `npm` by default.

## Proposed Changes

We will create a new Node.js project in the `backend` directory. We will backup the existing Python files, initialize `package.json`, configure TypeScript, and translate the Python code to TypeScript.

### Project Setup
- Initialize `package.json` with dependencies: `express`, `cors`, `dotenv`, `nodemailer`, `zod`, `uuid`.
- Add dev dependencies: `typescript`, `ts-node`, `nodemon`, and necessary `@types/*` packages.
- Create `tsconfig.json`.

### Backend Components

#### [DELETE] Existing Python Files
- `backend/main.py`
- `backend/models.py`
- `backend/services.py`
- `backend/seed_data.py`
- `backend/requirements.txt`

#### [NEW] `backend/src/seed_data.ts`
- Port all hardcoded data (`DOMAINS`, `COURSES`, `QUESTIONS`) from `seed_data.py` to exported TypeScript arrays.

#### [NEW] `backend/src/models.ts`
- Define TypeScript interfaces and **Zod** schemas for request validation, replacing the Pydantic classes (e.g., `AssessmentEvaluateRequest`, `LeadCaptureRequest`, `DemoBookingRequest`).

#### [NEW] `backend/src/services.ts`
- Translate the business logic, score calculation, and file-based data storage (`LEADS_STORE`).
- Replace `smtplib` with `nodemailer` for the `dispatch_assessment_result_email` and `dispatch_demo_booking_email` functions.
- Handle reading and writing to `data/leads.json` and `data/email_logs.json` using Node's `fs/promises`.

#### [NEW] `backend/src/index.ts`
- Set up the Express application, configure CORS and body-parsing middleware.
- Define all API routes (`/api/health`, `/api/v1/courses`, `/api/v1/assessments/evaluate`, etc.) and wire them to the services.
- Implement Zod middleware for request body validation.
- Start the server on the configured port (default 8000).

#### [MODIFY] `backend/.env` (if applicable)
- Ensure `.env` is compatible with `dotenv` (no changes likely needed as standard `.env` formats match).

#### [MODIFY] `start.bat` / `run_all.py` (if applicable)
- Update any root-level start scripts to run `npm run dev` in the backend instead of `uvicorn main:app`.

## Verification Plan

### Automated Tests
- N/A for this phase, but we will ensure the TypeScript compiler (`tsc`) passes with zero errors.

### Manual Verification
1. Start the Node.js backend.
2. Verify the health check endpoint returns 200 OK.
3. Start the frontend application.
4. Run through the entire assessment flow on the frontend, ensuring questions load, the evaluation processes correctly, the lead modal captures data, and the final results/email simulation succeeds.
