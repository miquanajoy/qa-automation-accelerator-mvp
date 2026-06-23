# AI PROMPTS

## Default Coding Prompt

```text
You are working on QA Automation Accelerator Platform.

Follow these rules:
- Use Next.js App Router.
- Use TypeScript.
- Follow Clean Architecture Lite.
- Do not put business logic inside route handlers.
- Use Prisma repository for database access.
- Keep code simple and maintainable.

Before coding:
1. Read PROJECT_CONTEXT.md
2. Read CODING_RULES.md
3. Read MODULE_GUIDE.md
4. Explain the implementation plan
5. Then implement only the requested task
```

## New Feature Prompt

```text
Implement the requested feature for QA Automation Accelerator Platform.

Before editing code:
1. Read docs/PROJECT_CONTEXT.md
2. Read docs/ARCHITECTURE.md
3. Read docs/CODING_RULES.md
4. Read docs/MODULE_GUIDE.md
5. Identify the affected module
6. Explain a short implementation plan

Rules:
- Use TypeScript strict mode.
- Keep API route handlers thin.
- Put business logic in use cases and services.
- Use repositories for database access.
- Avoid unnecessary abstractions.
- Add or update tests when behavior is non-trivial.
```

## API Route Prompt

```text
Create or update a Next.js App Router API route.

Rules:
- The route handler must not contain business logic.
- The route handler should validate input, call one use case, and return a typed JSON response.
- Database access must go through a repository.
- Keep error responses consistent with docs/API_CONTRACT.md.
- Update docs/API_CONTRACT.md if the API contract changes.
```

## Service Prompt

```text
Create or update a service in the relevant module.

Rules:
- Keep the service independent from UI and API route handlers.
- Use explicit TypeScript input and output types.
- Keep functions small and testable.
- Do not use Prisma directly unless this is a repository.
- Add focused tests for important behavior.
```

## Repository Prompt

```text
Create or update a Prisma repository.

Rules:
- Encapsulate all Prisma calls inside the repository.
- Do not leak unnecessary Prisma details to UI or API routes.
- Return typed application data.
- Keep methods small and named by use case needs.
- Keep the Prisma schema aligned with docs/DATABASE_SCHEMA.md.
```

## UI Prompt

```text
Create or update UI for QA Automation Accelerator Platform.

Rules:
- Build a focused engineering tool interface.
- Do not create a marketing landing page unless explicitly requested.
- Do not call Prisma directly from UI.
- Fetch data through API routes.
- Show loading, empty, and error states.
- Keep UI terminology aligned with docs/PROJECT_CONTEXT.md and docs/UI_REQUIREMENTS.md.
```

## Refactor Prompt

```text
Refactor the requested code without changing behavior.

Before editing:
1. Read docs/CODING_RULES.md
2. Identify the current behavior
3. Explain the refactor plan

Rules:
- Keep changes small and reviewable.
- Do not introduce new architecture patterns.
- Preserve public API behavior.
- Run relevant tests or explain why tests could not be run.
```

