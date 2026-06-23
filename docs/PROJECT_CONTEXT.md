# PROJECT CONTEXT

## Project Name

QA Automation Accelerator Platform

## Goal

Build an MVP that helps QA Engineers crawl websites, analyze DOM structure, generate locators, evaluate locator quality, and generate Page Object code for automation tests.

The platform should reduce repetitive manual work when creating automation test foundations and help teams produce more stable locators and maintainable Page Objects.

## Target Users

- Manual QA who wants to start writing automation tests faster.
- QA Automation Engineer who needs reliable locators and Page Object scaffolding.
- QA Engineer who wants to inspect web pages, understand DOM structure, and accelerate automation setup.

## Tech Stack

- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Playwright
- Cheerio

## Architecture

Use Clean Architecture Lite.

Principles:

- Keep the codebase simple and maintainable.
- Do not use microservices for the MVP.
- Do not use CQRS.
- Do not use complex DDD patterns.
- Separate UI, API route handlers, use cases, services, repositories, and shared domain types.
- API routes should be thin and delegate work to use cases.
- Business logic should live in use cases and services.
- Database access should go through repositories.

## MVP Scope

The MVP should support:

- Create and manage projects.
- Crawl a target website URL.
- Store crawled page snapshots.
- Parse HTML/DOM from crawled pages.
- Generate candidate locators for important elements.
- Score locator stability and readability.
- Generate Page Object code from selected locators.

## Non-Goals For MVP

- No distributed crawling system.
- No multi-tenant enterprise authorization unless explicitly requested.
- No test execution dashboard unless explicitly requested.
- No complex workflow engine.
- No plugin system.

