# QA Automation Accelerator - Guide

## Requirements

- Node.js 20+
- npm
- Docker Desktop, if you want to run PostgreSQL locally with Docker Compose

## Install Dependencies

Run this once after cloning or opening the project:

```bash
npm install
```

## Environment Config

The project uses `.env` for local config.

Current local database URL:

```bash
DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_automation_accelerator?schema=public"
NEXT_PUBLIC_APP_NAME="QA Automation Accelerator"
```

If `.env` is missing, copy values from `.env.example`.

## Run The App

Start the Next.js dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/dashboard
```

If port `3000` is already in use, Next.js may suggest another port.

## Stop The App

In the terminal running `npm run dev`, press:

```text
Control + C
```

This stops the local Next.js dev server.

## Start PostgreSQL

Option A is Docker Compose.

First, check Docker CLI:

```bash
docker --version
docker compose version
```

If both commands work, start PostgreSQL:

```bash
npm run db:up
```

This runs the `postgres` service from `docker-compose.yml`.

If the terminal shows `docker: command not found`, Docker Desktop is not
installed or the Docker CLI is not available in the current terminal. Install
or open Docker Desktop, then open a new terminal and retry the commands above.

Download Docker Desktop:

```text
https://www.docker.com/products/docker-desktop/
```

Option B is a local PostgreSQL install without Docker. In that case, create a
database manually and update `.env` so `DATABASE_URL` points to your local
PostgreSQL user, password, host, port, and database name.

## Stop PostgreSQL

To stop and remove the local Docker Compose services:

```bash
npm run db:down
```

The database volume is kept unless you manually remove Docker volumes.

## Prisma Setup

Generate Prisma Client:

```bash
npm run prisma:generate
```

The Phase 2 schema foundation migration is already present at:

```text
prisma/migrations/20260622000100_phase_2_schema_foundation/migration.sql
```

When PostgreSQL is running, apply migrations with:

```bash
npm run prisma:migrate
```

## Authentication

The app now has basic local authentication:

- Register page: `http://localhost:3000/register`
- Login page: `http://localhost:3000/login`
- Protected app entry: `http://localhost:3000/dashboard`

Login accepts either email or username.

Password requirements:

- At least 7 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

After login/register, the app stores an HTTP-only session cookie.

To logout, use the `Logout` button in the top bar.

## Create Test Admin Account

After PostgreSQL is running and Prisma migrations are applied, create or update
the local admin test account:

```bash
npm run seed:admin
```

Test credentials:

```text
username: admin
email: admin@example.com
password: Thuychan7733
```

## Seed Demo Project

After migrations are applied, create one demo project with a page, elements,
locator reports, snapshot data, and a generated file:

```bash
npm run seed:demo
```

## Project Management

Project CRUD is available after login:

- List projects: `http://localhost:3000/projects`
- Create project: `http://localhost:3000/projects/new`
- Project detail: `http://localhost:3000/projects/{projectId}`

Project APIs:

- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

## Single URL Crawl

After login, open a project detail page and use the `Crawl URL` form.

Flow:

1. Open `http://localhost:3000/projects`.
2. Open a project.
3. Enter a URL or domain, for example `example.com`.
4. Click `Crawl`.
5. If the URL does not include `http://` or `https://`, the app automatically
   adds `https://`.
6. The app opens the URL with Playwright.
7. The app stores the final URL, title, and HTML in the `Page` table.
8. Crawl history appears under the project.
9. Click `View` in crawl history to inspect the stored HTML preview.
10. Click `Analyze DOM` to extract testable buttons, inputs, textareas,
    selects, links, labels, forms, roles, test ids, CSS selectors, and XPath
    selectors.
11. Click `Generate Locators` to create Playwright, Selenium By, CSS, and XPath
    locator candidates for the parsed elements.

Crawler APIs:

- `POST /api/crawl`
- `GET /api/projects/:id/pages`
- `GET /api/pages/:id`
- `GET /api/pages/:id/elements`
- `POST /api/pages/:id/elements`
- `GET /api/pages/:id/locators`
- `POST /api/pages/:id/locators`

## Locator Generation

After a page has been crawled and analyzed, open the page detail screen and use
`Generate Locators`.

The generator is deterministic and uses this priority:

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

Generated locators are stored in the `LocatorReport` table and shown grouped by
element in the page detail UI.

## Locator Stability Scoring

Each generated locator gets:

- Score from `0` to `100`.
- Recommendation: `Recommended`, `Acceptable`, `Weak`, or `Avoid`.
- Reason explaining the base score and deductions.

Current base score:

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

The scorer deducts points for unstable patterns such as dynamic classes,
generated ids, long XPath, deep CSS selector, `nth-child`/`nth-of-type`,
generated class names, and long text locators.

## Locator Export

Locator screens support lightweight export actions:

- `Export CSV` exports filtered locator rows for spreadsheet review.
- `Export JSON` exports filtered locator groups for scripts or tooling.
- `Copy Recommended` copies the best recommended locator line for each matched
  element.

Exports respect the current search and locator type filters.

## Check Database Connection

After the app and PostgreSQL are running, open:

```text
http://localhost:3000/api/health/db
```

Expected successful response:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## Useful Checks

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

Validate Prisma schema:

```bash
npx prisma validate
```

## Common Issues

### `docker: command not found`

Docker is not installed or Docker Desktop is not available in the current terminal.

Fix:

1. Install Docker Desktop if it is not installed.
2. Open Docker Desktop.
3. Wait until Docker is running.
4. Open a new terminal.
5. Verify Docker CLI:

```bash
docker --version
docker compose version
```

Then try:

```bash
npm run db:up
```

If you do not want to use Docker, install PostgreSQL locally and update
`DATABASE_URL` in `.env`.

### Database connection fails

Check that PostgreSQL is running:

```bash
docker compose ps
```

Then confirm `.env` has the same user, password, database, host, and port as `docker-compose.yml`.

### Port 3000 is already used

Stop the other process or run Next.js on another port:

```bash
npm run dev -- -p 3001
```

Then open:

```text
http://localhost:3001/dashboard
```

## Current Phase

The project has completed the MVP flow through Phase 7:

- Phase 1: project bootstrap.
- Phase 2: database schema foundation and auth tables.
- Phase 3: Project CRUD.
- Phase 4: single URL crawler.
- Phase 5: DOM parser for automation-relevant elements.
- Phase 6: deterministic locator generation.
- Phase 7: locator stability scoring.
