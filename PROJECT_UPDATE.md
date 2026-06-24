# Project Update

## Phase 1 - Project Bootstrap

Status: Mostly complete.

What has been done:

- Created a Next.js App Router project.
- Enabled TypeScript strict mode.
- Added ESLint config.
- Added basic app layout.
- Added sidebar navigation.
- Added placeholder pages:
  - Dashboard
  - Projects
  - Crawl
  - Locators
  - Snapshots
  - Generator
- Added Clean Architecture Lite folder structure:
  - `src/app`
  - `src/modules`
  - `src/infrastructure`
  - `src/shared`
  - `src/lib`
- Added Prisma setup.
- Added PostgreSQL Docker Compose config.
- Added `.env` and `.env.example`.
- Added shared Prisma client.
- Added shared API response helpers.
- Added database health check API:
  - `GET /api/health/db`
- Added `guide.md` with local setup and run instructions.

Verification:

- `npm install` works.
- `npm run dev` works.
- `npm run lint` passes.
- `npm run build` passes.
- `npx prisma validate` passes.
- `npx prisma generate` works.

Notes:

- Docker Desktop must be installed and running before `npm run db:up` can work.

## Authentication Update

Status: Basic auth is working.

What has been done:

- Added register page:
  - `/register`
- Added login page:
  - `/login`
- Added logout button in the app top bar.
- Added protected app layout.
- Redirect unauthenticated users to `/login`.
- Added auth APIs:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
- Added local session storage with HTTP-only cookie.
- Added password hashing with `bcryptjs`.
- Added password validation rules:
  - At least 7 characters.
  - At least 1 uppercase letter.
  - At least 1 lowercase letter.
  - At least 1 number.
- Login accepts either email or username.
- Added `User` and `AuthSession` models.
- Added admin seed script:
  - `npm run seed:admin`

Test admin credentials:

```text
username: admin
email: admin@example.com
password: Thuychan7733
```

## Phase 2 - Database Schema Foundation

Status: Schema foundation is complete. Database apply depends on local PostgreSQL.

What has been done:

- Reworked Prisma schema for MVP database foundation.
- Added MVP models:
  - `Project`
  - `Page`
  - `Element`
  - `LocatorReport`
  - `Snapshot`
  - `GeneratedFile`
- Kept auth models:
  - `User`
  - `AuthSession`
- Added relationships:
  - Project has many pages.
  - Page belongs to project.
  - Page has many elements.
  - Page has many snapshots.
  - Page has many generated files.
  - Element belongs to page.
  - Element has many locator reports.
  - LocatorReport belongs to element.
  - Snapshot belongs to page.
  - GeneratedFile belongs to page.
- Added generated migration SQL:
  - `prisma/migrations/20260622000100_phase_2_schema_foundation/migration.sql`
- Added migration lock file:
  - `prisma/migrations/migration_lock.toml`
- Added demo project seed script:
  - `npm run seed:demo`
- Updated database schema documentation:
  - `docs/DATABASE_SCHEMA.md`
- Updated setup guide:
  - `guide.md`

Verification:

- `npx prisma validate` passes.
- `npx prisma generate` works.
- `npm run lint` passes.
- `npm run build` passes.
- Seed script syntax checks pass.

To apply the database schema locally:

```bash
npm run db:up
npm run prisma:migrate
npm run seed:admin
npm run seed:demo
```

## Phase 3 - Project Management MVP

Status: Complete.

What has been done:

- Added Project CRUD module using Clean Architecture Lite.
- Added project DTOs:
  - `create-project.dto.ts`
  - `update-project.dto.ts`
- Added project repository using Prisma.
- Added project service.
- Added project use cases:
  - Create project.
  - List projects.
  - Get project detail.
  - Update project.
  - Delete project.
- Added Project APIs:
  - `GET /api/projects`
  - `POST /api/projects`
  - `GET /api/projects/:id`
  - `PUT /api/projects/:id`
  - `DELETE /api/projects/:id`
- Added UI pages:
  - `/projects`
  - `/projects/new`
  - `/projects/[id]`
- Added basic validation for project name and description.

Verification:

- User can create a project.
- User can view project list.
- User can open project detail.
- User can update project metadata.
- User can delete a project.
- API routes stay thin and call use cases.

## Phase 4 - Crawler Vertical Slice

Status: Complete for single URL crawl.

What has been done:

- Added Playwright crawler adapter:
  - `src/infrastructure/playwright/playwright-crawler.adapter.ts`
- Added crawler DTO:
  - `crawl-url.dto.ts`
- Added crawler service.
- Added crawler use cases:
  - Crawl URL.
  - List project pages.
  - Get page detail.
- Added page repository for storing crawl results in `Page`.
- Added Crawl APIs:
  - `POST /api/crawl`
  - `GET /api/projects/:id/pages`
  - `GET /api/pages/:id`
- Added crawl form inside project detail page.
- Added crawl history table under each project.
- Added crawled page detail UI:
  - `/pages/[id]`
- Stored crawled URL, title, HTML, and timestamps.
- Added clear validation error for invalid URLs.
- Added timeout error handling for slow pages.
- Added URL normalization so users can enter `example.com` without typing
  `https://`.

Verification:

- Invalid URL returns a clear validation message.
- `https://example.com` crawls successfully.
- HTML is stored in the database.
- Page title is stored in the database.
- Crawl history returns saved pages.
- Page detail API returns stored HTML and `htmlSize`.
- `npm run lint` passes.
- `npm run build` passes.

## Phase 5 - DOM Parser MVP

Status: Complete for MVP.

What has been done:

- Added Cheerio DOM parser adapter.
- Added parser module with repository, service, and use cases.
- Added parser APIs:
  - `GET /api/pages/:id/elements`
  - `POST /api/pages/:id/elements`
- Added `Analyze DOM` button in Page Detail.
- Extracts automation-relevant elements only:
  - `button`
  - `input`
  - `textarea`
  - `select`
  - `a`
  - `label`
  - `form`
  - `[role]`
  - `[data-testid]`
  - `[data-test]`
  - `[aria-label]`
- Stores extracted elements in the `Element` table.
- Added element fields:
  - tag name
  - id
  - class
  - text
  - role
  - aria-label
  - name
  - placeholder
  - type
  - href
  - data-testid
  - data-test
  - CSS selector
  - XPath
- UI now shows Element ID, attributes, locator strategy, suggested locator,
  CSS selector, and XPath.

Verification:

- `Analyze DOM` runs from Page Detail.
- Elements are saved to database.
- Element table renders in UI.
- Uplizd page parse returned 110 automation-relevant candidates.
- `npm run lint` passes.
- `npm run build` passes.

## Phase 6 - Locator Generator v1

Status: Complete for MVP.

What has been done:

- Added locator module using Strategy Pattern.
- Added locator strategy files for:
  - `data-testid`
  - `data-test`
  - `aria-label`
  - role plus accessible name
  - id
  - name
  - placeholder
  - text
  - CSS selector
  - XPath
- Added deterministic locator generation priority:
  1. `data-testid`
  2. `data-test`
  3. `aria-label`
  4. role plus accessible name
  5. id
  6. name
  7. placeholder
  8. text
  9. CSS selector
  10. XPath
- Added Playwright locator output.
- Added Selenium By output.
- Added CSS selector and XPath fallback output.
- Added locator repository, service, and use cases.
- Added locator APIs:
  - `GET /api/pages/:id/locators`
  - `POST /api/pages/:id/locators`
- Saved generated candidates into the `LocatorReport` table.
- Added `Generate Locators` button in Page Detail.
- Added grouped locator UI by element.

Verification:

- Locator generation works for parsed page elements.
- Generated locators are saved in database.
- Page Detail can load generated locators by element.
- `npm run lint` passes.
- `npm run build` passes.

## Phase 7 - Locator Stability Scoring

Status: Complete for MVP.

What has been done:

- Added centralized locator stability scoring service.
- Scores every generated locator from `0` to `100`.
- Adds recommendation labels:
  - `Recommended`
  - `Acceptable`
  - `Weak`
  - `Avoid`
- Adds clear score reason text with base score and deductions.
- Added base scoring:
  - `data-testid`: 95
  - `data-test`: 90
  - `aria-label`: 85
  - role plus accessible name: 80
  - id: 75
  - name: 70
  - placeholder: 65
  - text: 55
  - CSS selector: 45
  - XPath: 35
- Detects unstable patterns:
  - dynamic class
  - generated id
  - long XPath
  - deep CSS selector
  - `nth-child` or `nth-of-type`
  - generated class pattern
  - long text locator
- UI now shows recommendation badges in Page Detail and Locators workspace.
- Added locator export actions:
  - Export filtered locators as CSV.
  - Export filtered locator groups as JSON.
  - Copy recommended locator lines.

Verification:

- Regenerated locators include score, reason, and recommendation.
- Locator scoring rules have focused automated tests.
- `npm run test:locator-scoring` passes with 5 tests.
- `npm run lint` passes.
- `npm run build` passes.

## Project Status Now

The app can currently do these things:

- Run as a Next.js app.
- Open the dashboard and feature pages.
- Show sidebar navigation for:
  - Projects
  - Crawl
  - Locators
  - Snapshots
  - Generator
- Create projects from the UI.
- List projects in the UI.
- View project detail.
- Update project name and description.
- Delete projects.
- Crawl a single URL from a project detail page.
- Store crawled page URL, title, and HTML in the `Page` table.
- Show crawl history for each project.
- Open crawled page detail and inspect stored HTML preview.
- Parse testable elements from crawled HTML.
- Inspect extracted element candidates with id, attributes, strategy, suggested
  locator, CSS, and XPath.
- Generate deterministic locator reports from parsed elements.
- View generated locators grouped by element.
- Inspect Playwright, Selenium By, CSS, and XPath locator outputs.
- See locator stability score, reason, and recommendation badge.
- Export filtered locators to CSV or JSON.
- Copy recommended locator lines for quick use in tests.
- Register a user when PostgreSQL is running and migrated.
- Login with email or username.
- Validate password rules during registration.
- Store a login session with an HTTP-only cookie.
- Protect app pages from unauthenticated access.
- Logout from the top bar.
- Connect to PostgreSQL through Prisma.
- Check database connection through `/api/health/db`.
- Seed an admin test account.
- Seed a demo project with:
  - One page.
  - Example elements.
  - Locator reports.
  - Snapshot data.
  - A generated file.

The app cannot do these things yet:

- Generate Page Object files from selected locators.
- Download or copy generated files from the UI.
- Mark one preferred locator as selected.

## Next Recommended Phase

Phase 8 should focus on Page Object generation:

- Let users choose preferred locators.
- Generate TypeScript Page Object files.
- Store generated files in `GeneratedFile`.
- Add generated code preview UI.
- Add copy/download actions for generated files.
