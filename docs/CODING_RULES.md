# CODING RULES

## TypeScript

- Use TypeScript strict mode.
- Do not use `any` unless there is a clear and documented reason.
- Prefer explicit types for function input and output.
- Use narrow types and validation for external input.

## Architecture Rules

- Do not write business logic directly inside API route handlers.
- API route handlers should only handle HTTP concerns and call use cases.
- Use cases orchestrate application workflows.
- Services handle business and processing logic.
- Repositories handle database access.
- Do not call Prisma directly from UI components.
- Do not call Prisma directly from API routes unless the file is a repository implementation.

## Code Style

- Keep each function small and easy to test.
- Prefer simple, readable code over clever abstractions.
- Use meaningful names for variables, functions, and modules.
- Avoid premature generalization.
- Keep files focused on one responsibility.
- Prefer early returns when they make flow easier to read.

## Error Handling

- Validate user input at API boundaries.
- Return predictable error responses from API routes.
- Use typed application errors where useful.
- Do not expose internal stack traces to users.

## Database

- Use Prisma repositories for database access.
- Keep Prisma models aligned with `DATABASE_SCHEMA.md`.
- Keep migrations small and focused.
- Avoid leaking Prisma-specific types across the whole application.

## Testing

- Prioritize tests for use cases and services.
- Add repository tests when database behavior is important.
- Mock external crawling and browser behavior when unit testing.
- Use integration tests for critical API flows when needed.

## Maintainability

- Code should be easy for another engineer or AI assistant to continue.
- Favor explicit behavior over hidden magic.
- Keep MVP features small and complete.
- Update docs when architecture, schema, or module responsibilities change.

