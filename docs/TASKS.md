# TASKS

## Phase 0: AI Coding Context

- [x] Create `docs/PROJECT_CONTEXT.md`.
- [x] Create `docs/ARCHITECTURE.md`.
- [x] Create `docs/CODING_RULES.md`.
- [x] Create `docs/DATABASE_SCHEMA.md`.
- [x] Create `docs/MODULE_GUIDE.md`.
- [x] Create `docs/API_CONTRACT.md`.
- [x] Create `docs/UI_REQUIREMENTS.md`.
- [x] Create `docs/TASKS.md`.
- [x] Create `docs/AI_PROMPTS.md`.

## Phase 1: Project Foundation

- [x] Initialize or verify Next.js App Router project.
- [x] Enable TypeScript strict mode.
- [x] Add Prisma and PostgreSQL configuration.
- [x] Create base folder structure under `src/modules`.
- [x] Add shared database client.
- [x] Add shared API response helpers.

## Phase 2: Database Schema Foundation

- [x] Create MVP Prisma schema foundation.
- [x] Add auth tables requested during bootstrap.
- [x] Add generated migration SQL for schema foundation.
- [x] Add demo project seed script.

## Phase 3: Project Management MVP

- [x] Define project types.
- [x] Create project repository.
- [x] Create project use cases.
- [x] Create project API routes.
- [x] Build project list UI.
- [x] Build create project UI.
- [x] Build project detail UI.
- [x] Build update project UI.
- [x] Build delete project action.

## Phase 4: Crawler And Snapshot Modules

- [x] Define crawler types.
- [x] Implement Playwright crawler adapter.
- [x] Implement crawler service.
- [x] Create crawl URL use case.
- [x] Store crawled HTML in Page table.
- [x] Store crawled title and URL.
- [x] Add `POST /api/crawl`.
- [x] Add `GET /api/projects/:id/pages`.
- [x] Add `GET /api/pages/:id`.
- [x] Add crawl form inside project detail page.
- [x] Add crawl history for each project.
- [x] Add crawled page detail view.

## Phase 5: Parser Module

- [x] Define parser types.
- [x] Implement Cheerio DOM parser service.
- [x] Extract automation-relevant elements only.
- [x] Store parsed elements.
- [x] Add `GET /api/pages/:id/elements`.
- [x] Add `POST /api/pages/:id/elements`.
- [x] Add Analyze DOM button in Page Detail UI.
- [x] Add extracted element table.
- [x] Show tag, text, id, class, role, CSS, and XPath.

## Phase 6: Locator Module

- [x] Define locator types.
- [x] Implement locator generator service.
- [x] Implement strategy-based locator scoring.
- [x] Store locator candidates.
- [x] Add locator generation API route.
- [x] Add locator review UI.

## Phase 7: Locator Stability Scoring

- [x] Add centralized locator stability scoring service.
- [x] Score each locator from 0 to 100.
- [x] Add recommendation labels.
- [x] Add score reasons and instability deductions.
- [x] Detect dynamic classes, generated ids, long XPath, deep CSS, nth-child, generated classes, and long text locators.
- [x] Show recommendation badges in locator UI.

## Phase 8: Generator Module

- [ ] Define generator types.
- [ ] Implement Page Object generator service.
- [ ] Store generated artifact.
- [ ] Add Page Object generation API route.
- [ ] Add generated code preview UI.

## Phase 9: MVP Hardening

- [ ] Add focused unit tests for services and use cases.
- [ ] Add validation for API requests.
- [ ] Improve error handling.
- [ ] Add basic logging.
- [ ] Review docs and update decisions.
