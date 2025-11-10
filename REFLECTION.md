Using AI agents: a short reflection

What I learned using AI agents

Working with an AI coding agent for this project accelerated many routine tasks: scaffolding new UI components, wiring routes, and producing repeatable controller/repository patterns. The agent was especially helpful at exploring the codebase quickly (finding files and likely places to change), proposing small, safe edits, and producing consistent DTO mappings and seed data. I also learned that the agent can make reasonable design decisions (e.g., where to place computed logic vs persisted fields) but still needs human oversight to validate domain assumptions and naming conventions.

Efficiency gains vs manual coding

The biggest gains were speed and reduced friction. Repetitive edits — creating new React components, adding controller mappings, and writing seed data — were completed much faster than doing them entirely by hand. The agent reduced context switching: I could ask for a focused change and get an edit applied across files. However, not all time was saved; some time was required to debug mismatches (API key naming, Prisma client/scheme synchronization) and to verify runtime behavior. Overall the agent raised throughput significantly for scaffolding and iteration while leaving verification and domain correctness to me.

Improvements I'd make next time

1) Stronger upfront specification: write a concise API contract (DTOs, units, success/failure shapes) and a small test plan before generating edits. This would avoid repeated DTO mapping fixes and save validation time.
2) Centralize DTO mapping and typing: add a shared `dto` module early so controllers and frontend adapters import the same TypeScript types (reduce snake_case/camelCase friction).
3) Tests-as-first-class: add unit tests for business logic (pool allocation, bank apply) before large refactors. The agent can help generate tests alongside code changes.
4) CI and schema gating: run `prisma generate` and type checks automatically in CI and fail fast on schema-client mismatches to prevent seed/runtime errors.

Conclusion

AI agents are powerful accelerators for iterative development and scaffolding. They complement, not replace, developer judgment: the agent speeds routine work and suggests solutions, and the developer confirms correctness, domain rules, and integration. With clearer contracts and automated checks, the next project using an AI agent would be even more efficient and less error-prone.
