# ARCHITECTURE

## Architecture Style

This project uses Clean Architecture Lite.

The goal is to keep clear boundaries without adding unnecessary complexity.

## High-Level Layers

```text
UI
  -> API Route
    -> Use Case
      -> Service
        -> Repository
          -> Database
```

## Layer Responsibilities

### UI

- Render screens and components.
- Collect user input.
- Call API endpoints.
- Do not call Prisma directly.
- Do not contain business rules.

### API Route

- Validate request shape.
- Call one use case.
- Convert use case results into HTTP responses.
- Do not contain business logic.
- Do not call Prisma directly.

### Use Case

- Orchestrate one user action or application workflow.
- Coordinate services and repositories.
- Enforce application-level rules.
- Return typed results that API routes can serialize.

### Service

- Contain domain logic and processing logic.
- Examples:
  - Crawl a URL.
  - Parse HTML.
  - Generate locator candidates.
  - Score locator quality.
  - Generate Page Object source code.

### Repository

- Encapsulate database access.
- Use Prisma internally.
- Return typed data to use cases and services.
- Keep SQL/Prisma details out of use cases and UI.

### Database

- PostgreSQL stores project data, crawl runs, snapshots, parsed elements, locators, and generated artifacts.

## Suggested Folder Shape

```text
src/
  app/
    api/
    projects/
  modules/
    project/
      domain/
      repositories/
      services/
      use-cases/
    crawler/
      domain/
      services/
      use-cases/
    parser/
      domain/
      services/
      use-cases/
    locator/
      domain/
      repositories/
      services/
      use-cases/
    snapshot/
      domain/
      repositories/
      services/
      use-cases/
    generator/
      domain/
      services/
      use-cases/
  shared/
    db/
    errors/
    http/
    types/
```

## Dependency Direction

- UI depends on API contracts.
- API routes depend on use cases.
- Use cases depend on services and repository interfaces.
- Repository implementations depend on Prisma.
- Services should not depend on UI or route handlers.

## Implementation Notes

- Prefer explicit TypeScript types.
- Keep modules independently understandable.
- Avoid abstractions until they reduce real duplication or clarify boundaries.
- Add tests around services and use cases when behavior becomes non-trivial.

