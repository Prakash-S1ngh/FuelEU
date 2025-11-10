# AI Agent Workflow Log

## Agents Used

- GitHub Copilot — the interactive coding assistant used throughout this session. No other external LLMs (Claude, Bard, etc.) were used.

## Prompts & Outputs

Example 1 — add a Pooling UI tab
- Prompt (exact):

"Add a new React component `PoolingTab.tsx` under `frontend/src/adapters/ui` that fetches `/compliance/adjusted-cb?year=YYYY`, allows selecting ships, previews pooled cbAfter and posts selected ship ids to POST `/pools`."

- Generated snippet (representative output produced by the agent):

```ts
function computePooling(members) {
  const selected = members.filter(m => m.selected);
  const poolSum = selected.reduce((s,m) => s + (m.cbBefore ?? 0), 0);
  // greedy allocation from surplus -> deficits
  // ...compute results and return { results, poolSum, valid, reason }
}
```

This snippet (and full component) was created, then iterated in the repo at `frontend/src/adapters/ui/PoolingTab.tsx`.

Example 2 — fix API shape mismatch and refine controller
- Prompt (exact):

"PoolingTab throws an error (cbBefore undefined)." 

- Agent action and refinement: the agent suggested mapping backend responses to the frontend DTO. After refinement we applied the following mapping in the compliance controller:

```ts
const mapped = {
  shipId: adjusted.ship_id,
  year: adjusted.year,
  cbBefore: adjusted.cb_adjusted ?? adjusted.cb_original ?? 0,
  cbAfter: undefined,
};
return res.json({ success: true, data: mapped });
```

We then refined the Pool controller to accept either an array of ship IDs or already-shaped member objects and to fetch adjusted CB when only IDs were provided.

## Validation / Corrections

- Read files before and after edits: every agent-produced change was inspected with file reads (`read_file`, `grep_search`) to confirm context and naming.
- Runtime verification: after schema changes we ran `npx prisma generate` and `npx prisma db push`, then executed the seed script. When the seed produced a Prisma client mismatch error, we regenerated the client and re-ran the seed.
- Type/shape validation: the frontend expected camelCase DTOs; controllers returned snake_case DB rows. We validated by observing frontend runtime errors (toFixed on undefined) and corrected controllers to return the expected DTO shape.
- Iterative fixes: where the agent's initial output didn't match runtime expectations (e.g., missing cbBefore, or `apply` failing with Insufficient banked credits), we updated controllers and the frontend (added a `/banking/balance` endpoint and UI checks) and re-tested.

## Observations

- Where the agent saved time:
  - Scaffolding components, writing repetitive controller/repository boilerplate, and generating a consistent seed dataset were fast with the agent.
  - Quick code patterns (map DTO, compute allocs) were produced rapidly, allowing focus on integration and domain checks.

- Where the agent failed or hallucinated:
  - The agent can assume API shapes or naming conventions (snake_case vs camelCase) that differ from the rest of the codebase; these assumptions have to be validated by running the app and checking runtime errors.
  - Sometimes the agent introduced code that compiled but did not match the runtime data flow (e.g., expected cbBefore to be present). Human verification caught these gaps.

- How tools were combined effectively:
  - Static reads (search/read_file) to gather context, small edits applied via patch tool, and quick re-runs of seeds/server allowed a tight edit-verify loop.
  - The todo list and patch apply workflow helped keep changes incremental and traceable.

## Best Practices Followed

- Keep prompts focused and incremental: ask for small, verifiable edits (a single controller change or a single UI component) rather than large feature dumps.
- Verify outputs immediately: run the app, check console/network errors, and iterate until the API contract and UI match.
- Centralize DTOs and types early: where possible, introduce shared TypeScript interfaces to avoid snake_case/camelCase mismatches (we applied controller-side mapping as a pragmatic fix; centralizing is a recommended next step).
- Use the agent for scaffolding and boilerplate; reserve domain decisions and validations for the human developer (e.g., sign conventions, emission factors, mapping business rules).

If you want I can now:
- Convert all controllers to use a small `mapDto` helper and add TypeScript DTOs, or
- Generate a PR summary listing every file changed with short reasons and verification steps.

End of log
## Agent workflow and prompt log

This document records the interactive, reproducible steps and prompts used while building the FuelEU project in this workspace. It includes the name of the automated coding agent used, representative prompts issued during development, and the commands to run and test the app locally.

---

Agent used
 - Name: GitHub Copilot (interactive coding assistant configured for this session)

Why this document
 - Capture the conversation-driven edits, reasoning and example prompts so reviewers can understand how features were added, tests were run, and bugs were resolved.

High-level timeline (what we built)
 - Fixed TypeScript import errors and adjusted type-only imports.
 - Added frontend UI tabs: Routes, Compliance, Pooling, Banking, Compare.
 - Extended backend Prisma schema and domain logic to include richer route fields (vessel type, fuel type, consumption, distance, total emissions) and computed values.
 - Implemented server-side compliance calculations and banking/pooling endpoints.
 - Created a seed script to populate test data (10 routes, compliance rows, bank entries, pools).
 - Iteratively debugged runtime issues (API shape mismatches, Prisma client & schema sync, pooling allocation edge-cases) and fixed them.

Representative prompts and how they were used
 - "There is a TypeScript import error: 'CompliancePort' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled."  
	 Action: Updated `frontend/src/adapters/infrastructure/Compliance.ts` to use `import type { CompliancePort }`.

 - "Add a Pooling Tab (Article 21) to the UI that fetches adjusted CBs, lets users select members and create a pool."  
	 Action: Created `frontend/src/adapters/ui/PoolingTab.tsx` with a greedy allocation preview and a POST to `/pools`.

 - "Routes tab should show vesselType, fuelType, fuelConsumption, distance, totalEmissions"  
	 Action: Extended backend Prisma `Route` model and domain logic; returned computed fields in API responses.

 - "Seeding: populate DB with 10 records for routes, compliance, banks, pools."  
	 Action: Edited `Backend/src/infrastructure/db/seed.ts` to insert 10 rows and related bank/pool rows. Note: after schema changes, run `prisma generate` and `prisma db push` (or migrations) before seeding.

 - "PoolingTab throws an error (cbBefore undefined)."  
	 Action: Mapped `/compliance/adjusted-cb` and `/compliance/cb` responses to the frontend shape `{ shipId, year, cbBefore, cbAfter? }` to avoid undefined values. Added controller-side mapping.

 - "Banking: users see 'Insufficient banked credits' when applying."  
	 Action: Added `GET /banking/balance` endpoint and updated `BankingTab.tsx` to fetch and display per-ship available balances and prevent over-apply in the UI.

Example prompts (copy/pasteable)
 - Create a new UI tab and wire it into the app:
	 "Add a new React component `PoolingTab.tsx` under `frontend/src/adapters/ui` that fetches `/compliance/adjusted-cb?year=YYYY`, allows selecting ships, previews pooled cbAfter and posts selected ship ids to POST `/pools`."

 - Fix runtime key mismatch between backend and frontend:
	 "The frontend expects `{ shipId, cbBefore }` but the backend returns `{ ship_id, cb_gco2eq }` — update the controller to return camelCase DTOs or add a mapping layer."

 - Add bank balance endpoint:
	 "Add `GET /banking/balance?shipId=...&year=...` that returns the total available banked credits for that ship and year."

How to run the project locally (dev)
 - Backend (from /Backend):

```bash
# install deps (if needed)
npm install

# run migrations / push schema (important after changing prisma schema)
npx prisma generate
npx prisma db push

# seed data (optional)
npx ts-node src/infrastructure/db/seed.ts

# start dev server (adjust script if you use nodemon or ts-node-dev)
npm run dev
```

 - Frontend (from /frontend):

```bash
npm install
npm run dev
```

Notes and conventions
 - API DTOs: the frontend expects camelCase keys (e.g. `shipId`, `cbBefore`). The backend stores snake_case column names due to Prisma/DB conventions. Controller mapping is used in multiple places to return consistent, client-friendly DTOs.
 - Units: CB values are in grams CO2e (gCO2e). Conversion to kg or tonnes should be performed explicitly when needed (kg = g/1000).
 - Sign convention: CB > 0 means surplus (available credits). CB < 0 means deficit (needs credits). Banking entries are stored as signed amounts; applying banked credits stores a negative bankEntry record.

Suggested next improvements
 - Centralize DTO mapping in a small helper so all controllers return consistent shapes.
 - Add unit tests for PoolEntity.allocate and BankService.applyBank to prevent regressions.
 - Add per-fuel energy/emission factors in the backend to compute total_emissions more accurately.



---

End of workflow log.

Additional prompt examples (useful during development)
 - "How do I run the Prisma client generation and DB push after schema changes?"  
	 Example: `npx prisma generate && npx prisma db push` — run this after editing `prisma/schema.prisma`.

 - "Create a small unit test for PoolEntity.allocate that covers a surplus -> deficit allocation."  
	 Example prompt: "Add Jest tests for `PoolEntity.allocate` covering: 1) simple surplus covers single deficit, 2) insufficient total throws error, 3) surplus ships don't go negative."

 - "Add integration test to verify POST /pools creates pool and poolMember rows in the DB."  
	 Example prompt: "Add a test that posts to `/pools` with three ships (one surplus, two deficits) and assert the DB pool and pool_member rows reflect the expected cb_after values."

 - "Standardize API responses to camelCase across all controllers."  
	 Example prompt: "Create a small helper mapDto(obj) that converts snake_case DB objects to camelCase DTOs and use it in all controllers (routes, compliance, bank, pool)."

 - "Add more realistic per-fuel emission factors and compute total_emissions from fuel consumption + emission factor."  
	 Example prompt: "Add a mapping table `fuelEnergyDensity` and `fuelEmissionFactor` to the backend domain and update `Route` computations to use these instead of a fixed constant. Add tests." 

 - "Create a brief deployment README with steps to build, run migrations, seed, and start the app on a Linux host."  
	 Example prompt: "Write `DEPLOY.md` describing `npm ci`, `npx prisma migrate deploy`, `npm run build`, Dockerfile example, and `docker-compose` for local deploy."

 - "Write a PR summary for the recent session edits."  
	 Example prompt: "Generate a PR summary that lists modified files, high-level reasons for each change, and verification steps for reviewers."

 - "Add TypeScript types for API DTOs and use them in controllers and frontend API adapters."  
	 Example prompt: "Create `src/adapters/dto` interfaces for `ComplianceBalance`, `BankRecord`, `PoolResponse` and import them across controllers and frontend adapters to keep shapes consistent."

 - "Improve frontend error handling to display server message bodies instead of generic alerts."  
	 Example prompt: "Replace `alert(...)` calls with a small `Toast` component and include server error message when present (`err?.response?.data?.message`)."

 - "Add CLI commands for common dev tasks (seed, reset-db, test)."  
	 Example prompt: "Add npm scripts: `seed`, `reset-db`, `test:unit` to package.json and document them in README."

