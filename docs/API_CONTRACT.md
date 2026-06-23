# API CONTRACT

## General Rules

- API routes use Next.js App Router.
- API routes should be thin.
- API routes should call use cases.
- Request and response bodies must be typed.
- Errors should return predictable JSON.

## Error Response Shape

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload"
  }
}
```

## Auth APIs

### Register

`POST /api/auth/register`

Request:

```json
{
  "email": "qa@example.com",
  "username": "qa_engineer",
  "password": "Password1"
}
```

Rules:

- Password must be at least 7 characters.
- Password must include at least one uppercase letter.
- Password must include at least one lowercase letter.
- Password must include at least one number.

Response:

```json
{
  "user": {
    "id": "user_id",
    "email": "qa@example.com",
    "username": "qa_engineer",
    "createdAt": "2026-06-22T00:00:00.000Z"
  }
}
```

The API sets an HTTP-only session cookie.

### Login

`POST /api/auth/login`

Request:

```json
{
  "identifier": "qa@example.com",
  "password": "Password1"
}
```

`identifier` can be an email or username.

Response:

```json
{
  "user": {
    "id": "user_id",
    "email": "qa@example.com",
    "username": "qa_engineer",
    "createdAt": "2026-06-22T00:00:00.000Z"
  }
}
```

The API sets an HTTP-only session cookie.

### Logout

`POST /api/auth/logout`

Response:

```json
{
  "ok": true
}
```

The API clears the session cookie.

## Project APIs

### Create Project

`POST /api/projects`

Request:

```json
{
  "name": "Example Project",
  "description": "Optional description"
}
```

Response:

```json
{
  "project": {
    "id": "project_id",
    "name": "Example Project",
    "description": "Optional description",
    "createdAt": "2026-06-22T00:00:00.000Z",
    "updatedAt": "2026-06-22T00:00:00.000Z"
  }
}
```

### List Projects

`GET /api/projects`

Response:

```json
{
  "projects": []
}
```

### Get Project

`GET /api/projects/:id`

Response:

```json
{
  "project": {
    "id": "project_id",
    "name": "Example Project",
    "description": "Optional description",
    "pageCount": 0,
    "createdAt": "2026-06-22T00:00:00.000Z",
    "updatedAt": "2026-06-22T00:00:00.000Z"
  }
}
```

### Update Project

`PUT /api/projects/:id`

Request:

```json
{
  "name": "Updated Project",
  "description": "Updated description"
}
```

Response:

```json
{
  "project": {
    "id": "project_id",
    "name": "Updated Project",
    "description": "Updated description",
    "createdAt": "2026-06-22T00:00:00.000Z",
    "updatedAt": "2026-06-22T00:00:00.000Z"
  }
}
```

### Delete Project

`DELETE /api/projects/:id`

Response:

```json
{
  "ok": true
}
```

## Crawler APIs

### Crawl URL

`POST /api/crawl`

Request:

```json
{
  "projectId": "project_id",
  "url": "example.com"
}
```

`url` accepts either a full URL such as `https://example.com` or a bare domain
such as `example.com`. Bare domains are normalized to `https://example.com/`
before Playwright opens the page.

Response:

```json
{
  "page": {
    "id": "page_id",
    "projectId": "project_id",
    "url": "https://example.com",
    "title": "Example Domain",
    "createdAt": "2026-06-22T00:00:00.000Z"
  }
}
```

The API opens the URL with Playwright, waits for network idle, extracts title
and HTML, then stores the result in the `Page` table.

### List Project Pages

`GET /api/projects/:id/pages`

Response:

```json
{
  "pages": []
}
```

### Get Page

`GET /api/pages/:id`

Response:

```json
{
  "page": {
    "id": "page_id",
    "projectId": "project_id",
    "url": "https://example.com",
    "title": "Example Domain",
    "html": "<html>...</html>",
    "htmlSize": 12345,
    "createdAt": "2026-06-22T00:00:00.000Z",
    "updatedAt": "2026-06-22T00:00:00.000Z"
  }
}
```

### List Parsed Elements

`GET /api/pages/:id/elements`

Response:

```json
{
  "elements": []
}
```

### Parse Page Elements

`POST /api/pages/:id/elements`

Response:

```json
{
  "elements": []
}
```

The parser extracts interactive candidates from stored HTML, including links,
buttons, inputs, selects, textareas, labels, forms, ARIA roles, `aria-label`,
`data-testid`, `data-test`, CSS selectors, and XPath selectors.

### List Generated Locators

`GET /api/pages/:id/locators`

Response:

```json
{
  "locatorGroups": [
    {
      "element": {
        "id": "element_id",
        "tagName": "button",
        "text": "Login",
        "elementId": "login-button"
      },
      "locators": [
        {
          "id": "locator_id",
          "locatorType": "playwright:id",
          "locatorValue": "page.locator('#login-button')",
          "score": 86,
          "recommendation": "Stable id locator",
          "reason": "ID is usually stable and readable when unique."
        }
      ]
    }
  ]
}
```

### Generate Page Locators

`POST /api/pages/:id/locators`

Response:

```json
{
  "locatorGroups": []
}
```

The locator generator reads parsed elements from the `Element` table and saves
deterministic locator candidates in `LocatorReport`. Locator priority is:
`data-testid`, `data-test`, `aria-label`, role plus accessible name, id, name,
placeholder, text, CSS selector, then XPath. Output includes Playwright,
Selenium By, CSS selector, and XPath formats when enough element data exists.

## Snapshot APIs

### Get Snapshot

`GET /api/projects/:projectId/snapshots/:snapshotId`

Response:

```json
{
  "snapshot": {
    "id": "snapshot_id",
    "url": "https://example.com",
    "title": "Example",
    "createdAt": "2026-06-22T00:00:00.000Z"
  }
}
```

## Parser APIs

### Parse Snapshot

`POST /api/projects/:projectId/snapshots/:snapshotId/parse`

Response:

```json
{
  "parsedElements": []
}
```

## Locator APIs

### Generate Locators

`POST /api/projects/:projectId/snapshots/:snapshotId/locators/generate`

Response:

```json
{
  "locators": []
}
```

### Select Locator

`PATCH /api/projects/:projectId/locators/:locatorId`

Request:

```json
{
  "isSelected": true
}
```

Response:

```json
{
  "locator": {
    "id": "locator_id",
    "isSelected": true
  }
}
```

## Generator APIs

### Generate Page Object

`POST /api/projects/:projectId/snapshots/:snapshotId/page-object`

Request:

```json
{
  "className": "ExamplePage"
}
```

Response:

```json
{
  "artifact": {
    "id": "artifact_id",
    "filename": "ExamplePage.ts",
    "language": "typescript",
    "content": "..."
  }
}
```
