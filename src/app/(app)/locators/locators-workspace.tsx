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

type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type CrawlHistoryItem = {
  id: string;
  projectId: string;
  url: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
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

type ProjectsResponse = {
  projects?: ProjectListItem[];
  error?: {
    message?: string;
  };
};

type PagesResponse = {
  pages?: CrawlHistoryItem[];
  error?: {
    message?: string;
  };
};

type LocatorsResponse = {
  locatorGroups?: LocatorGroup[];
  error?: {
    message?: string;
  };
};

const LOCATOR_GROUP_PAGE_SIZE = 20;

function groupName(group: LocatorGroup): string {
  return (
    group.element.name ??
    group.element.text ??
    group.element.elementId ??
    group.element.tagName
  );
}

function groupSearchText(group: LocatorGroup): string {
  return [
    group.element.tagName,
    group.element.elementId,
    group.element.className,
    group.element.text,
    group.element.role,
    group.element.ariaLabel,
    group.element.name,
    group.element.placeholder,
    group.element.href,
    group.element.testId,
    group.element.test,
    group.element.xpath,
    group.element.cssSelector,
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

export function LocatorsWorkspace() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [pages, setPages] = useState<CrawlHistoryItem[]>([]);
  const [locatorGroups, setLocatorGroups] = useState<LocatorGroup[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");
  const [query, setQuery] = useState("");
  const [locatorTypeFilter, setLocatorTypeFilter] = useState("all");
  const [visibleGroupCount, setVisibleGroupCount] = useState(
    LOCATOR_GROUP_PAGE_SIZE
  );
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isPagesLoading, setIsPagesLoading] = useState(false);
  const [isLocatorsLoading, setIsLocatorsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/projects");
        const body = (await response.json()) as ProjectsResponse;

        if (!response.ok || !body.projects) {
          setError(body.error?.message ?? "Unable to load projects");
          return;
        }

        setProjects(body.projects);
        setSelectedProjectId((current) => current || body.projects?.[0]?.id || "");
      } catch {
        setError("Unable to reach project API");
      } finally {
        setIsProjectsLoading(false);
      }
    }

    void loadProjects();
  }, []);

  useEffect(() => {
    async function loadPages() {
      if (!selectedProjectId) {
        setPages([]);
        setSelectedPageId("");
        return;
      }

      setIsPagesLoading(true);
      setError(null);
      setMessage(null);
      setLocatorGroups([]);

      try {
        const response = await fetch(`/api/projects/${selectedProjectId}/pages`);
        const body = (await response.json()) as PagesResponse;

        if (!response.ok || !body.pages) {
          setError(body.error?.message ?? "Unable to load pages");
          return;
        }

        setPages(body.pages);
        setSelectedPageId(body.pages[0]?.id ?? "");
      } catch {
        setError("Unable to reach pages API");
      } finally {
        setIsPagesLoading(false);
      }
    }

    void loadPages();
  }, [selectedProjectId]);

  useEffect(() => {
    async function loadLocators() {
      if (!selectedPageId) {
        setLocatorGroups([]);
        return;
      }

      setIsLocatorsLoading(true);
      setError(null);
      setMessage(null);

      try {
        const response = await fetch(`/api/pages/${selectedPageId}/locators`);
        const body = (await response.json()) as LocatorsResponse;

        if (!response.ok || !body.locatorGroups) {
          setError(body.error?.message ?? "Unable to load locators");
          return;
        }

        setLocatorGroups(body.locatorGroups);
      } catch {
        setError("Unable to reach locator API");
      } finally {
        setIsLocatorsLoading(false);
      }
    }

    void loadLocators();
  }, [selectedPageId]);

  async function handleGenerateLocators() {
    if (!selectedPageId) {
      setError("Select a crawled page before generating locators");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/pages/${selectedPageId}/locators`, {
        method: "POST"
      });
      const body = (await response.json()) as LocatorsResponse;

      if (!response.ok || !body.locatorGroups) {
        setError(body.error?.message ?? "Unable to generate locators");
        return;
      }

      setLocatorGroups(body.locatorGroups);
      setVisibleGroupCount(LOCATOR_GROUP_PAGE_SIZE);
      setMessage(
        `Generated ${body.locatorGroups.reduce(
          (total, group) => total + group.locators.length,
          0
        )} locators for ${body.locatorGroups.length} elements`
      );
    } catch {
      setError("Unable to reach locator generator API");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyRecommended(groups: LocatorGroup[]) {
    const text = buildRecommendedLocatorText(groups);

    if (!text) {
      setError("No locators available to copy");
      return;
    }

    await navigator.clipboard.writeText(text);
    setError(null);
    setMessage(`Copied ${groups.length} recommended locator lines`);
  }

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );
  const selectedPage = pages.find((page) => page.id === selectedPageId);
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
  const filteredGroups = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

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
          groupSearchText(group).includes(normalizedQuery)
        );
      });
  }, [locatorGroups, locatorTypeFilter, query]);
  const visibleGroups = filteredGroups.slice(0, visibleGroupCount);
  const exportBaseName =
    selectedPage?.title ?? selectedPage?.url ?? selectedProject?.name ?? "locators";

  return (
    <section className="page">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Locators</h1>
          <p className="page-description">
            Select a crawled page, generate deterministic locators, and review
            candidates by element.
          </p>
        </div>
        {selectedPageId ? (
          <Link className="link-button" href={`/pages/${selectedPageId}`}>
            Open Page Detail
          </Link>
        ) : null}
      </div>

      <section className="panel">
        <div className="panel__header">
          <div>
            <div className="panel__title">Locator Source</div>
            <div className="panel__meta">
              {selectedProject?.name ?? "Select project"}{" "}
              {selectedPage ? `- ${selectedPage.title ?? selectedPage.url}` : ""}
            </div>
          </div>
          <button
            className="primary-button"
            disabled={isGenerating || !selectedPageId}
            onClick={handleGenerateLocators}
            type="button"
          >
            {isGenerating ? "Generating..." : "Generate Locators"}
          </button>
        </div>

        <div className="filter-bar">
          <label className="filter-field">
            <span>Project</span>
            <select
              disabled={isProjectsLoading || projects.length === 0}
              onChange={(event) => {
                setSelectedProjectId(event.target.value);
                setVisibleGroupCount(LOCATOR_GROUP_PAGE_SIZE);
              }}
              value={selectedProjectId}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Page</span>
            <select
              disabled={isPagesLoading || pages.length === 0}
              onChange={(event) => {
                setSelectedPageId(event.target.value);
                setVisibleGroupCount(LOCATOR_GROUP_PAGE_SIZE);
              }}
              value={selectedPageId}
            >
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.title ?? page.url}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-field">
            <span>Search</span>
            <input
              onChange={(event) => {
                setQuery(event.target.value);
                setVisibleGroupCount(LOCATOR_GROUP_PAGE_SIZE);
              }}
              placeholder="Element, locator, reason..."
              type="search"
              value={query}
            />
          </label>

          <label className="filter-field">
            <span>Type</span>
            <select
              onChange={(event) => {
                setLocatorTypeFilter(event.target.value);
                setVisibleGroupCount(LOCATOR_GROUP_PAGE_SIZE);
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
        </div>

        {message ? <div className="inline-success">{message}</div> : null}
        {error ? <div className="inline-error">{error}</div> : null}

        {isProjectsLoading || isPagesLoading || isLocatorsLoading ? (
          <div className="empty-state">Loading locator workspace...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            Create a project and crawl a page before generating locators.
          </div>
        ) : pages.length === 0 ? (
          <div className="empty-state">
            No crawled pages found for this project. Use Crawl first.
          </div>
        ) : locatorGroups.length === 0 ? (
          <div className="empty-state">
            No locators generated yet. Generate locators after analyzing DOM on
            the page detail screen.
          </div>
        ) : (
          <>
            <div className="export-toolbar">
              <div className="filter-summary">
                Showing {visibleGroups.length.toLocaleString()} of{" "}
                {filteredGroups.length.toLocaleString()} matched groups
              </div>
              <details className="export-menu">
                <summary>Export</summary>
                <div className="export-menu__options">
                  <button
                    className="export-menu__item"
                    onClick={() =>
                      downloadTextFile(
                        safeExportFilename(exportBaseName, "csv"),
                        buildLocatorCsv(filteredGroups, selectedPage?.url ?? ""),
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
                        safeExportFilename(exportBaseName, "json"),
                        buildLocatorJson(filteredGroups, selectedPage?.url ?? ""),
                        "application/json;charset=utf-8"
                      )
                    }
                    type="button"
                  >
                    Export JSON
                  </button>
                  <button
                    className="export-menu__item"
                    onClick={() => void handleCopyRecommended(filteredGroups)}
                    type="button"
                  >
                    Copy Recommended
                  </button>
                </div>
              </details>
            </div>

            <div className="locator-groups">
              {visibleGroups.map((group) => (
                <div className="locator-group" key={group.element.id}>
                  <div className="locator-group__header">
                    <div>
                      <div className="table-strong">{groupName(group)}</div>
                      <div className="table-muted">
                        {group.element.tagName}
                        {group.element.elementId
                          ? ` #${group.element.elementId}`
                          : ""}
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

            {filteredGroups.length > visibleGroups.length ? (
              <div className="load-more-row">
                <button
                  className="secondary-button"
                  onClick={() =>
                    setVisibleGroupCount(
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
    </section>
  );
}
