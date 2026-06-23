# MODULE GUIDE

## Module List

- `modules/project`
- `modules/crawler`
- `modules/parser`
- `modules/locator`
- `modules/snapshot`
- `modules/generator`

## modules/project

Responsible for project management.

Expected responsibilities:

- Create project.
- Update project metadata.
- List projects.
- Get project detail.
- Store project base URL and configuration.

Typical files:

- `project.types.ts`
- `project.repository.ts`
- `project.service.ts`
- `create-project.use-case.ts`
- `list-projects.use-case.ts`

## modules/crawler

Responsible for crawling target websites.

Expected responsibilities:

- Start crawl run.
- Fetch pages with Playwright.
- Respect crawl limits.
- Capture HTML and page metadata.
- Store snapshots through the snapshot module.

Typical files:

- `crawler.types.ts`
- `crawler.service.ts`
- `start-crawl.use-case.ts`

## modules/parser

Responsible for parsing HTML and extracting useful DOM information.

Expected responsibilities:

- Parse HTML with Cheerio.
- Extract candidate interactive elements.
- Normalize element attributes.
- Produce parsed element records for locator generation.

Typical files:

- `parser.types.ts`
- `dom-parser.service.ts`
- `parse-snapshot.use-case.ts`

## modules/locator

Responsible for generating and evaluating locators.

Expected responsibilities:

- Generate locator candidates.
- Score locator quality.
- Prefer resilient Playwright locators.
- Explain why each locator received its score.
- Store selected locator candidates.

Locator preference order:

1. Role-based locator.
2. Label locator.
3. Placeholder locator.
4. Test id locator.
5. Text locator.
6. CSS locator.
7. XPath locator only as a fallback.

Typical files:

- `locator.types.ts`
- `locator.repository.ts`
- `locator-generator.service.ts`
- `locator-scoring.service.ts`
- `generate-locators.use-case.ts`

## modules/snapshot

Responsible for storing and retrieving crawled page snapshots.

Expected responsibilities:

- Save raw HTML.
- Save page URL and title.
- Retrieve snapshots by project.
- Retrieve snapshot detail for parsing and generation.

Typical files:

- `snapshot.types.ts`
- `snapshot.repository.ts`
- `snapshot.service.ts`
- `create-snapshot.use-case.ts`
- `get-snapshot.use-case.ts`

## modules/generator

Responsible for generating Page Object code.

Expected responsibilities:

- Convert selected locators into Page Object classes.
- Generate TypeScript Playwright code.
- Produce readable method and property names.
- Store generated artifacts.

Typical files:

- `generator.types.ts`
- `page-object-generator.service.ts`
- `generate-page-object.use-case.ts`

