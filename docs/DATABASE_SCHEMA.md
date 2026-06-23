# DATABASE SCHEMA

## Database

PostgreSQL with Prisma.

This file describes the intended MVP data model. Keep the Prisma schema aligned
with this document.

## Phase 2 Scope

The MVP database foundation includes:

- `Project`
- `Page`
- `Element`
- `LocatorReport`
- `Snapshot`
- `GeneratedFile`
- `User`
- `AuthSession`

`User` and `AuthSession` support the basic authentication requested during
bootstrap.

## Entities

### User

Represents a local MVP user account.

Fields:

- `id`: Unique user id.
- `email`: Unique email address.
- `username`: Unique username.
- `passwordHash`: Hashed password.
- `createdAt`: Creation timestamp.
- `updatedAt`: Last update timestamp.

Relationships:

- Has many auth sessions.

### AuthSession

Represents one logged-in browser session.

Fields:

- `id`: Unique session id.
- `userId`: Related user id.
- `tokenHash`: Hash of the raw session token stored in the HTTP-only cookie.
- `expiresAt`: Session expiry timestamp.
- `createdAt`: Creation timestamp.

Relationships:

- Belongs to user.

### Project

Represents a QA automation project.

Fields:

- `id`: Unique project id.
- `name`: Project name.
- `description`: Optional project description.
- `createdAt`: Creation timestamp.
- `updatedAt`: Last update timestamp.

Relationships:

- Has many pages.

### Page

Stores a crawled page for a project.

Fields:

- `id`: Unique page id.
- `projectId`: Related project id.
- `url`: Captured page URL.
- `title`: Optional page title.
- `html`: Raw HTML content.
- `createdAt`: Creation timestamp.
- `updatedAt`: Last update timestamp.

Relationships:

- Belongs to project.
- Has many elements.
- Has many snapshots.
- Has many generated files.

### Element

Represents an extracted DOM element from a page.

Fields:

- `id`: Unique element id.
- `pageId`: Related page id.
- `tagName`: HTML tag name.
- `elementId`: Optional HTML id attribute.
- `className`: Optional class attribute.
- `text`: Optional visible text.
- `role`: Optional ARIA role.
- `name`: Optional accessible name.
- `xpath`: Optional XPath selector.
- `cssSelector`: Optional CSS selector.
- `createdAt`: Creation timestamp.
- `updatedAt`: Last update timestamp.

Relationships:

- Belongs to page.
- Has many locator reports.

### LocatorReport

Represents one locator recommendation or score for an element.

Fields:

- `id`: Unique locator report id.
- `elementId`: Related element id.
- `locatorType`: Locator type such as `role`, `text`, `css`, or `xpath`.
- `locatorValue`: Locator value or generated locator expression.
- `score`: Numeric quality score.
- `recommendation`: Optional recommendation text.
- `reason`: Optional scoring explanation.
- `createdAt`: Creation timestamp.
- `updatedAt`: Last update timestamp.

Relationships:

- Belongs to element.

### Snapshot

Stores JSON snapshot data for a page.

Fields:

- `id`: Unique snapshot id.
- `pageId`: Related page id.
- `snapshotData`: JSON snapshot payload.
- `createdAt`: Creation timestamp.
- `updatedAt`: Last update timestamp.

Relationships:

- Belongs to page.

### GeneratedFile

Stores generated source code or output files for a page.

Fields:

- `id`: Unique generated file id.
- `pageId`: Related page id.
- `type`: File type, for example `page_object`.
- `content`: Generated file content.
- `createdAt`: Creation timestamp.
- `updatedAt`: Last update timestamp.

Relationships:

- Belongs to page.
