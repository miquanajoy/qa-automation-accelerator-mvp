# UI REQUIREMENTS

## Product UX Goal

The UI should help QA Engineers move from a website URL to usable automation code with as little friction as possible.

The experience should feel like a focused engineering tool, not a marketing site.

## Main Screens

### Project List

Purpose:

- Show existing projects.
- Allow creating a new project.
- Open a project workspace.

Expected UI:

- Project table or compact list.
- Create project action.
- Search or filter can be added later.

### Project Detail

Purpose:

- Show project metadata and base URL.
- Show recent crawl runs.
- Show snapshots.
- Provide actions to start crawling.

Expected UI:

- Project summary.
- Crawl action.
- Crawl run status.
- Snapshot list.

### Crawl Run Detail

Purpose:

- Show crawl status and discovered pages.
- Help user inspect crawl output.

Expected UI:

- Status indicator.
- Start URL.
- Captured pages.
- Error message if crawl failed.

### Snapshot Detail

Purpose:

- Show captured page information.
- Allow DOM parsing.
- Show parsed elements.
- Generate locators.

Expected UI:

- Snapshot metadata.
- Parsed element list.
- Locator generation action.
- Locator quality scores.

### Locator Review

Purpose:

- Let the user compare candidate locators and select preferred locators.

Expected UI:

- Element summary.
- Locator candidates.
- Score and scoring reason.
- Select/unselect control.

### Page Object Generator

Purpose:

- Generate and preview TypeScript Playwright Page Object code.

Expected UI:

- Class name input.
- Generate action.
- Code preview.
- Copy/download action can be added later.

## UI Rules

- Keep layouts dense, clear, and work-focused.
- Use readable tables or lists for engineering data.
- Avoid decorative landing-page sections.
- Prefer clear controls and predictable navigation.
- Show loading and error states for API operations.
- Use consistent terminology from the docs.

## Important States

- Empty project list.
- Project created successfully.
- Crawl pending.
- Crawl running.
- Crawl completed.
- Crawl failed.
- No snapshots yet.
- Snapshot parsing in progress.
- No parsed elements found.
- Locator generation completed.
- Page Object generated.

