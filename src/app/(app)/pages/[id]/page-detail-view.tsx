"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  buildLocatorCsv,
  buildLocatorJson,
  buildRecommendedLocatorText,
  downloadTextFile,
  safeExportFilename
} from "@/shared/helpers/locator-export";

type PageDetail = {
  id: string;
  projectId: string;
  url: string;
  title: string | null;
  html: string;
  htmlSize: number;
  createdAt: string;
  updatedAt: string;
};

type PageDetailResponse = {
  page?: PageDetail;
  error?: {
    message?: string;
  };
};

type ParsedElement = {
  id: string;
  pageId: string;
  tagName: string;
  elementId: string | null;
  className: string | null;
  text: string | null;
  role: string | null;
  ariaLabel: string | null;
  name: string | null;
  placeholder: string | null;
  type: string | null;
  href: string | null;
  testId: string | null;
  test: string | null;
  xpath: string | null;
  cssSelector: string | null;
  createdAt: string;
  updatedAt: string;
};

type ElementsResponse = {
  elements?: ParsedElement[];
  error?: {
    message?: string;
  };
};

type LocatorReport = {
  id: string;
  elementId: string;
  locatorType: string;
  locatorValue: string;
  score: number;
  recommendation: string;
  reason: string;
  createdAt: string;
  updatedAt: string;
};

type LocatorGroup = {
  element: ParsedElement;
  locators: LocatorReport[];
};

type LocatorsResponse = {
  locatorGroups?: LocatorGroup[];
  error?: {
    message?: string;
  };
};

type PreviewMode = "body" | "raw";

const ELEMENT_PAGE_SIZE = 50;
const LOCATOR_GROUP_PAGE_SIZE = 20;

function cleanBodyPreview(html: string): string {
  if (typeof window === "undefined") {
    return html.slice(0, 12000);
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const body = document.body;

  if (!body) {
    return html.slice(0, 12000);
  }

  body
    .querySelectorAll("script, style, noscript, template, svg")
    .forEach((element) => element.remove());

  const cleanedHtml = body.innerHTML
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();

  return cleanedHtml || body.textContent?.trim() || "No body content found.";
}

function escapeLocatorText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function locatorStrategy(element: ParsedElement): string {
  if (element.elementId) {
    return "ID";
  }

  if (element.testId) {
    return "Test ID";
  }

  if (element.test) {
    return "Data Test";
  }

  if (element.role && element.name) {
    return "Role";
  }

  if (element.tagName === "input" && element.name) {
    return "Label";
  }

  if (element.text) {
    return "Text";
  }

  if (element.cssSelector) {
    return "CSS";
  }

  return "XPath";
}

function suggestedLocator(element: ParsedElement): string {
  if (element.elementId) {
    return `page.locator('#${escapeLocatorText(element.elementId)}')`;
  }

  if (element.testId) {
    return `page.getByTestId('${escapeLocatorText(element.testId)}')`;
  }

  if (element.test) {
    return `page.locator('[data-test="${escapeLocatorText(element.test)}"]')`;
  }

  if (element.role && element.name) {
    return `page.getByRole('${escapeLocatorText(element.role)}', { name: '${escapeLocatorText(element.name)}' })`;
  }

  if (element.tagName === "input" && element.name) {
    return `page.getByLabel('${escapeLocatorText(element.name)}')`;
  }

  if (element.text) {
    return `page.getByText('${escapeLocatorText(element.text)}')`;
  }

  return `page.locator('${escapeLocatorText(element.cssSelector ?? element.xpath ?? element.tagName)}')`;
}

function sortedElements(elements: ParsedElement[]): ParsedElement[] {
  const priorityByStrategy: Record<string, number> = {
    ID: 0,
    "Test ID": 1,
    "Data Test": 2,
    Role: 3,
    Label: 4,
    Text: 5,
    CSS: 6,
    XPath: 7
  };

  return [...elements].sort((first, second) => {
    const firstPriority = priorityByStrategy[locatorStrategy(first)];
    const secondPriority = priorityByStrategy[locatorStrategy(second)];

    if (firstPriority !== secondPriority) {
      return firstPriority - secondPriority;
    }

    return (first.name ?? first.text ?? first.tagName).localeCompare(
      second.name ?? second.text ?? second.tagName
    );
  });
}

function attributeSummary(element: ParsedElement): string {
  const attributes = [
    element.ariaLabel ? `aria-label="${element.ariaLabel}"` : null,
    element.placeholder ? `placeholder="${element.placeholder}"` : null,
    element.type ? `type="${element.type}"` : null,
    element.href ? `href="${element.href}"` : null,
    element.testId ? `data-testid="${element.testId}"` : null,
    element.test ? `data-test="${element.test}"` : null,
    element.className ? `class="${element.className}"` : null
  ].filter(Boolean);

  return attributes.length > 0 ? attributes.join("\n") : "-";
}

function elementSearchText(element: ParsedElement): string {
  return [
    element.tagName,
    element.elementId,
    element.className,
    element.text,
    element.role,
    element.ariaLabel,
    element.name,
    element.placeholder,
    element.type,
    element.href,
    element.testId,
    element.test,
    element.xpath,
    element.cssSelector,
    locatorStrategy(element)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function locatorGroupSearchText(group: LocatorGroup): string {
  return [
    elementSearchText(group.element),
    ...group.locators.flatMap((locator) => [
      locator.locatorType,
      locator.locatorValue,
      locator.recommendation,
      locator.reason
    ])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function recommendationBadgeClass(recommendation: string): string {
  const normalized = recommendation.toLowerCase();
  const badgeType = ["recommended", "acceptable", "weak", "avoid"].includes(
    normalized
  )
    ? normalized
    : "acceptable";

  return `recommendation-badge recommendation-badge--${badgeType}`;
}

export function PageDetailView({ pageId }: { pageId: string }) {
  const [page, setPage] = useState<PageDetail | null>(null);
  const [elements, setElements] = useState<ParsedElement[]>([]);
  const [locatorGroups, setLocatorGroups] = useState<LocatorGroup[]>([]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("body");
  const [elementQuery, setElementQuery] = useState("");
  const [elementStrategyFilter, setElementStrategyFilter] = useState("all");
  const [elementTagFilter, setElementTagFilter] = useState("all");
  const [visibleElementCount, setVisibleElementCount] = useState(ELEMENT_PAGE_SIZE);
  const [locatorQuery, setLocatorQuery] = useState("");
  const [locatorTypeFilter, setLocatorTypeFilter] = useState("all");
  const [visibleLocatorGroupCount, setVisibleLocatorGroupCount] = useState(
    LOCATOR_GROUP_PAGE_SIZE
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isElementsLoading, setIsElementsLoading] = useState(true);
  const [isLocatorsLoading, setIsLocatorsLoading] = useState(true);
  const [isParsing, setIsParsing] = useState(false);
  const [isGeneratingLocators, setIsGeneratingLocators] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elementError, setElementError] = useState<string | null>(null);
  const [elementMessage, setElementMessage] = useState<string | null>(null);
  const [locatorError, setLocatorError] = useState<string | null>(null);
  const [locatorMessage, setLocatorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadPage() {
      try {
        const response = await fetch(`/api/pages/${pageId}`);
        const body = (await response.json()) as PageDetailResponse;

        if (!response.ok || !body.page) {
          setError(body.error?.message ?? "Unable to load crawled page");
          return;
        }

        setPage(body.page);
      } catch {
        setError("Unable to reach page API");
      } finally {
        setIsLoading(false);
      }
    }

    void loadPage();
  }, [pageId]);

  useEffect(() => {
    async function loadElements() {
      try {
        const response = await fetch(`/api/pages/${pageId}/elements`);
        const body = (await response.json()) as ElementsResponse;

        if (!response.ok || !body.elements) {
          setElementError(body.error?.message ?? "Unable to load elements");
          return;
        }

        setElements(body.elements);
      } catch {
        setElementError("Unable to reach element API");
      } finally {
        setIsElementsLoading(false);
      }
    }

    void loadElements();
  }, [pageId]);

  useEffect(() => {
    async function loadLocators() {
      try {
        const response = await fetch(`/api/pages/${pageId}/locators`);
        const body = (await response.json()) as LocatorsResponse;

        if (!response.ok || !body.locatorGroups) {
          setLocatorError(body.error?.message ?? "Unable to load locators");
          return;
        }

        setLocatorGroups(body.locatorGroups);
      } catch {
        setLocatorError("Unable to reach locator API");
      } finally {
        setIsLocatorsLoading(false);
      }
    }

    void loadLocators();
  }, [pageId]);

  const sortedElementList = useMemo(() => sortedElements(elements), [elements]);
  const elementTagOptions = useMemo(
    () => [...new Set(sortedElementList.map((element) => element.tagName))],
    [sortedElementList]
  );
  const elementStrategyOptions = useMemo(
    () => [...new Set(sortedElementList.map((element) => locatorStrategy(element)))],
    [sortedElementList]
  );
  const filteredElements = useMemo(() => {
    const normalizedQuery = elementQuery.trim().toLowerCase();

    return sortedElementList.filter((element) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        elementSearchText(element).includes(normalizedQuery);
      const matchesStrategy =
        elementStrategyFilter === "all" ||
        locatorStrategy(element) === elementStrategyFilter;
      const matchesTag =
        elementTagFilter === "all" || element.tagName === elementTagFilter;

      return matchesQuery && matchesStrategy && matchesTag;
    });
  }, [elementQuery, elementStrategyFilter, elementTagFilter, sortedElementList]);
  const visibleElements = filteredElements.slice(0, visibleElementCount);
  const locatorTypeOptions = useMemo(
    () => [
      ...new Set(
        locatorGroups.flatMap((group) =>
          group.locators.map((locator) => locator.locatorType)
        )
      )
    ],
    [locatorGroups]
  );
  const filteredLocatorGroups = useMemo(() => {
    const normalizedQuery = locatorQuery.trim().toLowerCase();

    return locatorGroups
      .map((group) => ({
        ...group,
        locators: group.locators.filter(
          (locator) =>
            locatorTypeFilter === "all" ||
            locator.locatorType === locatorTypeFilter
        )
      }))
      .filter((group) => {
        if (group.locators.length === 0) {
          return false;
        }

        return (
          normalizedQuery.length === 0 ||
          locatorGroupSearchText(group).includes(normalizedQuery)
        );
      });
  }, [locatorGroups, locatorQuery, locatorTypeFilter]);
  const visibleLocatorGroups = filteredLocatorGroups.slice(
    0,
    visibleLocatorGroupCount
  );
  const pageHtml = page?.html ?? "";
  const previewContent = useMemo(() => {
    if (previewMode === "body") {
      return cleanBodyPreview(pageHtml).slice(0, 12000);
    }

    return pageHtml.slice(0, 12000);
  }, [pageHtml, previewMode]);

  async function handleParseElements() {
    setElementError(null);
    setElementMessage(null);
    setIsParsing(true);

    try {
      const response = await fetch(`/api/pages/${pageId}/elements`, {
        method: "POST"
      });
      const body = (await response.json()) as ElementsResponse;

      if (!response.ok || !body.elements) {
        setElementError(body.error?.message ?? "Unable to parse elements");
        return;
      }

      setElements(body.elements);
      setElementMessage(`Parsed ${body.elements.length} candidate elements`);
    } catch {
      setElementError("Unable to reach element parser API");
    } finally {
      setIsParsing(false);
    }
  }

  async function handleGenerateLocators() {
    setLocatorError(null);
    setLocatorMessage(null);
    setIsGeneratingLocators(true);

    try {
      const response = await fetch(`/api/pages/${pageId}/locators`, {
        method: "POST"
      });
      const body = (await response.json()) as LocatorsResponse;

      if (!response.ok || !body.locatorGroups) {
        setLocatorError(body.error?.message ?? "Unable to generate locators");
        return;
      }

      setLocatorGroups(body.locatorGroups);
      setLocatorMessage(
        `Generated ${body.locatorGroups.reduce(
          (total, group) => total + group.locators.length,
          0
        )} locators for ${body.locatorGroups.length} elements`
      );
    } catch {
      setLocatorError("Unable to reach locator generator API");
    } finally {
      setIsGeneratingLocators(false);
    }
  }

  async function handleCopyRecommended(groups: LocatorGroup[]) {
    const text = buildRecommendedLocatorText(groups);

    if (!text) {
      setLocatorError("No locators available to copy");
      return;
    }

    await navigator.clipboard.writeText(text);
    setLocatorError(null);
    setLocatorMessage(`Copied ${groups.length} recommended locator lines`);
  }

  if (isLoading) {
    return (
      <section className="page">
        <div className="empty-state">Loading crawled page...</div>
      </section>
    );
  }

  if (error || !page) {
    return (
      <section className="page">
        <div className="page-header">
          <h1 className="page-title">Crawled Page</h1>
        </div>
        <section className="panel">
          <div className="empty-state">{error ?? "Page not found"}</div>
        </section>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="page-header">
        <Link className="text-link" href={`/projects/${page.projectId}`}>
          Back to Project
        </Link>
        <h1 className="page-title">{page.title ?? "Untitled page"}</h1>
        <p className="page-description">{page.url}</p>
      </div>

      <div className="metric-grid metric-grid--compact">
        <div className="metric">
          <div className="metric__label">HTML Size</div>
          <div className="metric__value metric__value--small">
            {page.htmlSize.toLocaleString()} chars
          </div>
          <div className="metric__note">Stored in Page.html</div>
        </div>
        <div className="metric">
          <div className="metric__label">Crawled</div>
          <div className="metric__value metric__value--small">
            {new Date(page.createdAt).toLocaleDateString()}
          </div>
          <div className="metric__note">
            {new Date(page.createdAt).toLocaleTimeString()}
          </div>
        </div>
        <div className="metric">
          <div className="metric__label">Updated</div>
          <div className="metric__value metric__value--small">
            {new Date(page.updatedAt).toLocaleDateString()}
          </div>
          <div className="metric__note">
            {new Date(page.updatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div>
            <div className="panel__title">Testable Elements</div>
            <div className="panel__meta">
              Automation-relevant elements extracted from stored HTML
            </div>
          </div>
          <button
            className="primary-button"
            disabled={isParsing}
            onClick={handleParseElements}
            type="button"
          >
            {isParsing ? "Analyzing..." : "Analyze DOM"}
          </button>
        </div>

        {elementMessage ? <div className="inline-success">{elementMessage}</div> : null}
        {elementError ? <div className="inline-error">{elementError}</div> : null}

        {isElementsLoading ? (
          <div className="empty-state">Loading elements...</div>
        ) : elements.length === 0 ? (
          <div className="empty-state">
            No elements parsed yet. Click Analyze DOM to extract candidates
            for testing.
          </div>
        ) : (
          <>
            <div className="filter-bar">
              <label className="filter-field">
                <span>Search</span>
                <input
                  onChange={(event) => {
                    setElementQuery(event.target.value);
                    setVisibleElementCount(ELEMENT_PAGE_SIZE);
                  }}
                  placeholder="ID, text, role, href, selector..."
                  type="search"
                  value={elementQuery}
                />
              </label>
              <label className="filter-field">
                <span>Strategy</span>
                <select
                  onChange={(event) => {
                    setElementStrategyFilter(event.target.value);
                    setVisibleElementCount(ELEMENT_PAGE_SIZE);
                  }}
                  value={elementStrategyFilter}
                >
                  <option value="all">All strategies</option>
                  {elementStrategyOptions.map((strategy) => (
                    <option key={strategy} value={strategy}>
                      {strategy}
                    </option>
                  ))}
                </select>
              </label>
              <label className="filter-field">
                <span>Tag</span>
                <select
                  onChange={(event) => {
                    setElementTagFilter(event.target.value);
                    setVisibleElementCount(ELEMENT_PAGE_SIZE);
                  }}
                  value={elementTagFilter}
                >
                  <option value="all">All tags</option>
                  {elementTagOptions.map((tagName) => (
                    <option key={tagName} value={tagName}>
                      {tagName}
                    </option>
                  ))}
                </select>
              </label>
              <div className="filter-summary">
                Showing {visibleElements.length.toLocaleString()} of{" "}
                {filteredElements.length.toLocaleString()} matched elements
              </div>
            </div>

            <div className="table-wrap table-wrap--bounded">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tag</th>
                  <th>Element ID</th>
                  <th>Name / Text</th>
                  <th>Attributes</th>
                  <th>Strategy</th>
                  <th>Suggested Locator</th>
                  <th>CSS Selector</th>
                  <th>XPath</th>
                </tr>
              </thead>
              <tbody>
                {visibleElements.map((element) => (
                  <tr key={element.id}>
                    <td>{element.tagName}</td>
                    <td>
                      {element.elementId ? (
                        <span className="id-pill">#{element.elementId}</span>
                      ) : (
                        <span className="muted-pill">No ID</span>
                      )}
                    </td>
                    <td>
                      <div className="table-strong">
                        {element.name ?? element.text ?? element.elementId ?? "Unnamed"}
                      </div>
                      {element.text ? (
                        <div className="table-muted">{element.text}</div>
                      ) : null}
                    </td>
                    <td className="mono-cell">{attributeSummary(element)}</td>
                    <td>
                      <span className="strategy-pill">{locatorStrategy(element)}</span>
                    </td>
                    <td className="mono-cell">{suggestedLocator(element)}</td>
                    <td className="mono-cell">{element.cssSelector ?? "-"}</td>
                    <td className="mono-cell">{element.xpath ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {filteredElements.length > visibleElements.length ? (
              <div className="load-more-row">
                <button
                  className="secondary-button"
                  onClick={() =>
                    setVisibleElementCount(
                      (current) => current + ELEMENT_PAGE_SIZE
                    )
                  }
                  type="button"
                >
                  Show 50 more elements
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <div className="panel__title">Generated Locators</div>
            <div className="panel__meta">
              Deterministic locator candidates grouped by element
            </div>
          </div>
          <button
            className="primary-button"
            disabled={isGeneratingLocators}
            onClick={handleGenerateLocators}
            type="button"
          >
            {isGeneratingLocators ? "Generating..." : "Generate Locators"}
          </button>
        </div>

        {locatorMessage ? (
          <div className="inline-success">{locatorMessage}</div>
        ) : null}
        {locatorError ? <div className="inline-error">{locatorError}</div> : null}

        {isLocatorsLoading ? (
          <div className="empty-state">Loading locators...</div>
        ) : locatorGroups.length === 0 ? (
          <div className="empty-state">
            No locators generated yet. Analyze DOM first, then click Generate
            Locators.
          </div>
        ) : (
          <>
            <div className="filter-bar">
              <label className="filter-field">
                <span>Search</span>
                <input
                  onChange={(event) => {
                    setLocatorQuery(event.target.value);
                    setVisibleLocatorGroupCount(LOCATOR_GROUP_PAGE_SIZE);
                  }}
                  placeholder="Element, locator, reason..."
                  type="search"
                  value={locatorQuery}
                />
              </label>
              <label className="filter-field">
                <span>Locator Type</span>
                <select
                  onChange={(event) => {
                    setLocatorTypeFilter(event.target.value);
                    setVisibleLocatorGroupCount(LOCATOR_GROUP_PAGE_SIZE);
                  }}
                  value={locatorTypeFilter}
                >
                  <option value="all">All locator types</option>
                  {locatorTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <div className="filter-summary">
                Showing {visibleLocatorGroups.length.toLocaleString()} of{" "}
                {filteredLocatorGroups.length.toLocaleString()} matched groups
              </div>
            </div>

            <div className="export-toolbar">
              <div className="filter-summary">
                Exporting filtered locator groups
              </div>
              <details className="export-menu">
                <summary>Export</summary>
                <div className="export-menu__options">
                  <button
                    className="export-menu__item"
                    onClick={() =>
                      downloadTextFile(
                        safeExportFilename(page.title ?? page.url, "csv"),
                        buildLocatorCsv(filteredLocatorGroups, page.url),
                        "text/csv;charset=utf-8"
                      )
                    }
                    type="button"
                  >
                    Export CSV
                  </button>
                  <button
                    className="export-menu__item"
                    onClick={() =>
                      downloadTextFile(
                        safeExportFilename(page.title ?? page.url, "json"),
                        buildLocatorJson(filteredLocatorGroups, page.url),
                        "application/json;charset=utf-8"
                      )
                    }
                    type="button"
                  >
                    Export JSON
                  </button>
                  <button
                    className="export-menu__item"
                    onClick={() =>
                      void handleCopyRecommended(filteredLocatorGroups)
                    }
                    type="button"
                  >
                    Copy Recommended
                  </button>
                </div>
              </details>
            </div>

            <div className="locator-groups">
              {visibleLocatorGroups.map((group) => (
              <div className="locator-group" key={group.element.id}>
                <div className="locator-group__header">
                  <div>
                    <div className="table-strong">
                      {group.element.name ??
                        group.element.text ??
                        group.element.elementId ??
                        group.element.tagName}
                    </div>
                    <div className="table-muted">
                      {group.element.tagName}
                      {group.element.elementId ? ` #${group.element.elementId}` : ""}
                    </div>
                  </div>
                  <span className="strategy-pill">
                    {group.locators.length} locators
                  </span>
                </div>

                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Score</th>
                        <th>Type</th>
                        <th>Locator</th>
                        <th>Recommendation</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.locators.map((locator) => (
                        <tr key={locator.id}>
                          <td>{locator.score}</td>
                          <td>
                            <span className="muted-pill">
                              {locator.locatorType}
                            </span>
                          </td>
                          <td className="mono-cell">{locator.locatorValue}</td>
                          <td>
                            <span
                              className={recommendationBadgeClass(
                                locator.recommendation
                              )}
                            >
                              {locator.recommendation}
                            </span>
                          </td>
                          <td>{locator.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              ))}
            </div>

            {filteredLocatorGroups.length > visibleLocatorGroups.length ? (
              <div className="load-more-row">
                <button
                  className="secondary-button"
                  onClick={() =>
                    setVisibleLocatorGroupCount(
                      (current) => current + LOCATOR_GROUP_PAGE_SIZE
                    )
                  }
                  type="button"
                >
                  Show 20 more locator groups
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <div className="panel__title">HTML Preview</div>
            <div className="panel__meta">
              {previewMode === "body"
                ? "Cleaned body preview, first 12,000 characters"
                : "Raw HTML, first 12,000 characters"}
            </div>
          </div>
          <div className="segmented-control" aria-label="Preview mode">
            <button
              className={
                previewMode === "body"
                  ? "segmented-control__item active"
                  : "segmented-control__item"
              }
              onClick={() => setPreviewMode("body")}
              type="button"
            >
              Body
            </button>
            <button
              className={
                previewMode === "raw"
                  ? "segmented-control__item active"
                  : "segmented-control__item"
              }
              onClick={() => setPreviewMode("raw")}
              type="button"
            >
              Raw
            </button>
          </div>
        </div>
        <pre className="code-preview">{previewContent}</pre>
      </section>
    </section>
  );
}
