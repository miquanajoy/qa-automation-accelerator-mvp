"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  downloadTextFile,
  safeExportFilename
} from "@/shared/helpers/locator-export";

type ProjectListItem = {
  id: string;
  name: string;
};

type CrawlHistoryItem = {
  id: string;
  projectId: string;
  url: string;
  title: string | null;
};

type ParsedElement = {
  id: string;
  tagName: string;
  elementId: string | null;
  text: string | null;
  role: string | null;
  ariaLabel: string | null;
  name: string | null;
  placeholder: string | null;
  href: string | null;
};

type LocatorReport = {
  id: string;
  locatorType: string;
  locatorValue: string;
  score: number;
  recommendation: string;
  reason: string;
};

type LocatorGroup = {
  element: ParsedElement;
  locators: LocatorReport[];
};

type GeneratedFile = {
  id: string;
  pageId: string;
  type: string;
  className: string;
  filename: string;
  content: string;
  createdAt: string;
  updatedAt: string;
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

type GeneratedFilesResponse = {
  generatedFiles?: GeneratedFile[];
  generatedFile?: GeneratedFile;
  error?: {
    message?: string;
  };
};

const ELEMENT_PAGE_SIZE = 60;

function elementLabel(element: ParsedElement): string {
  return (
    element.name ??
    element.ariaLabel ??
    element.placeholder ??
    element.text ??
    element.elementId ??
    element.tagName
  );
}

function groupSearchText(group: LocatorGroup): string {
  const locator = bestPlaywrightLocator(group);

  return [
    elementLabel(group.element),
    group.element.tagName,
    group.element.elementId,
    group.element.role,
    group.element.href,
    locator?.locatorType,
    locator?.locatorValue,
    locator?.recommendation
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function bestPlaywrightLocator(group: LocatorGroup): LocatorReport | null {
  return (
    group.locators
      .filter((locator) => locator.locatorType.startsWith("playwright:"))
      .sort((first, second) => second.score - first.score)[0] ?? null
  );
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

export function GeneratorWorkspace() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [pages, setPages] = useState<CrawlHistoryItem[]>([]);
  const [locatorGroups, setLocatorGroups] = useState<LocatorGroup[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");
  const [elementQuery, setElementQuery] = useState("");
  const [visibleElementCount, setVisibleElementCount] =
    useState(ELEMENT_PAGE_SIZE);
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(
    new Set()
  );
  const [preview, setPreview] = useState<GeneratedFile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
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
        setSelectedProjectId(body.projects[0]?.id ?? "");
      } catch {
        setError("Unable to reach project API");
      } finally {
        setIsLoading(false);
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

      setIsPageLoading(true);
      setError(null);
      setMessage(null);
      setLocatorGroups([]);
      setGeneratedFiles([]);
      setPreview(null);

      try {
        const response = await fetch(`/api/projects/${selectedProjectId}/pages`);
        const body = (await response.json()) as PagesResponse;

        if (!response.ok || !body.pages) {
          setError(body.error?.message ?? "Unable to load pages");
          return;
        }

        setPages(body.pages);
        setSelectedPageId(body.pages[0]?.id ?? "");
        setElementQuery("");
        setVisibleElementCount(ELEMENT_PAGE_SIZE);
      } catch {
        setError("Unable to reach page API");
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadPages();
  }, [selectedProjectId]);

  useEffect(() => {
    async function loadGeneratorSource() {
      if (!selectedPageId) {
        setLocatorGroups([]);
        setGeneratedFiles([]);
        setSelectedElementIds(new Set());
        return;
      }

      setIsPageLoading(true);
      setError(null);
      setMessage(null);

      try {
        const [locatorsResponse, filesResponse] = await Promise.all([
          fetch(`/api/pages/${selectedPageId}/locators`),
          fetch(`/api/pages/${selectedPageId}/page-object`)
        ]);
        const locatorsBody =
          (await locatorsResponse.json()) as LocatorsResponse;
        const filesBody =
          (await filesResponse.json()) as GeneratedFilesResponse;

        if (!locatorsResponse.ok || !locatorsBody.locatorGroups) {
          setError(locatorsBody.error?.message ?? "Unable to load locators");
          return;
        }

        if (!filesResponse.ok || !filesBody.generatedFiles) {
          setError(
            filesBody.error?.message ?? "Unable to load generated Page Objects"
          );
          return;
        }

        const groupsWithPlaywright = locatorsBody.locatorGroups.filter(
          (group) => bestPlaywrightLocator(group) !== null
        );

        setLocatorGroups(groupsWithPlaywright);
        setSelectedElementIds(
          new Set(groupsWithPlaywright.map((group) => group.element.id))
        );
        setGeneratedFiles(filesBody.generatedFiles);
        setPreview(filesBody.generatedFiles[0] ?? null);
      } catch {
        setError("Unable to reach generator APIs");
      } finally {
        setIsPageLoading(false);
      }
    }

    void loadGeneratorSource();
  }, [selectedPageId]);

  const selectedPage = pages.find((page) => page.id === selectedPageId);
  const selectedCount = selectedElementIds.size;
  const allSelected =
    locatorGroups.length > 0 && selectedCount === locatorGroups.length;
  const selectedGroups = useMemo(
    () =>
      locatorGroups.filter((group) => selectedElementIds.has(group.element.id)),
    [locatorGroups, selectedElementIds]
  );
  const filteredGroups = useMemo(() => {
    const normalizedQuery = elementQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return locatorGroups;
    }

    return locatorGroups.filter((group) =>
      groupSearchText(group).includes(normalizedQuery)
    );
  }, [elementQuery, locatorGroups]);
  const visibleGroups = filteredGroups.slice(0, visibleElementCount);

  function toggleElement(elementId: string) {
    setSelectedElementIds((current) => {
      const next = new Set(current);

      if (next.has(elementId)) {
        next.delete(elementId);
      } else {
        next.add(elementId);
      }

      return next;
    });
  }

  function toggleAll() {
    setSelectedElementIds(
      allSelected
        ? new Set()
        : new Set(locatorGroups.map((group) => group.element.id))
    );
  }

  async function handleGenerate() {
    if (!selectedPageId || selectedCount === 0) {
      setError("Select at least one element before generating");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/pages/${selectedPageId}/page-object`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          selectedElementIds: [...selectedElementIds]
        })
      });
      const body = (await response.json()) as GeneratedFilesResponse;

      if (!response.ok || !body.generatedFile) {
        setError(body.error?.message ?? "Unable to generate Page Object");
        return;
      }

      setPreview(body.generatedFile);
      setGeneratedFiles((current) => [body.generatedFile as GeneratedFile, ...current]);
      setMessage(
        `${body.generatedFile.filename} generated and saved to database`
      );
    } catch {
      setError("Unable to reach Page Object generator API");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!preview) {
      return;
    }

    await navigator.clipboard.writeText(preview.content);
    setMessage(`${preview.filename} copied to clipboard`);
  }

  return (
    <section className="page">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Generator</h1>
          <p className="page-description">
            Generate a Playwright TypeScript Page Object from the highest-scored
            locator selected for each element.
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
            <div className="panel__title">Page Object Source</div>
            <div className="panel__meta">
              {selectedPage?.title ?? selectedPage?.url ?? "Select a page"}
            </div>
          </div>
          <button
            className="primary-button"
            disabled={isGenerating || selectedCount === 0}
            onClick={handleGenerate}
            type="button"
          >
            {isGenerating ? "Generating..." : "Generate & Save"}
          </button>
        </div>

        <div className="filter-bar generator-filter-bar">
          <label className="filter-field">
            <span>Project</span>
            <select
              disabled={isLoading || projects.length === 0}
              onChange={(event) => setSelectedProjectId(event.target.value)}
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
              disabled={isPageLoading || pages.length === 0}
              onChange={(event) => setSelectedPageId(event.target.value)}
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
            <span>Search Elements</span>
            <input
              onChange={(event) => {
                setElementQuery(event.target.value);
                setVisibleElementCount(ELEMENT_PAGE_SIZE);
              }}
              placeholder="Text, ID, role, locator..."
              type="search"
              value={elementQuery}
            />
          </label>

          <div className="filter-summary">
            {selectedCount} of {locatorGroups.length} elements selected
          </div>
        </div>

        {message ? <div className="inline-success">{message}</div> : null}
        {error ? <div className="inline-error">{error}</div> : null}

        {isLoading || isPageLoading ? (
          <div className="empty-state">Loading generator source...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">Create a project first.</div>
        ) : pages.length === 0 ? (
          <div className="empty-state">Crawl a page before generating code.</div>
        ) : locatorGroups.length === 0 ? (
          <div className="empty-state">
            Analyze DOM and generate locators for this page first.
          </div>
        ) : (
          <div className="generator-layout">
            <div className="generator-selection">
              <div className="generator-selection__header">
                <div>
                  <div className="panel__title">Locator Properties</div>
                  <div className="panel__meta">
                    Highest-scored Playwright locator per element
                  </div>
                </div>
                <button
                  className="text-button"
                  onClick={toggleAll}
                  type="button"
                >
                  {allSelected ? "Clear all" : "Select all"}
                </button>
              </div>

              <div className="generator-element-list">
                {visibleGroups.map((group) => {
                  const locator = bestPlaywrightLocator(group);

                  if (!locator) {
                    return null;
                  }

                  return (
                    <label className="generator-element" key={group.element.id}>
                      <input
                        checked={selectedElementIds.has(group.element.id)}
                        onChange={() => toggleElement(group.element.id)}
                        type="checkbox"
                      />
                      <span className="generator-element__content">
                        <span className="generator-element__title">
                          {elementLabel(group.element)}
                        </span>
                        <span className="generator-element__meta">
                          {group.element.tagName}
                          {group.element.elementId
                            ? ` #${group.element.elementId}`
                            : ""}
                        </span>
                        <code>{locator.locatorValue}</code>
                      </span>
                      <span
                        className={recommendationBadgeClass(
                          locator.recommendation
                        )}
                      >
                        {locator.score}
                      </span>
                    </label>
                  );
                })}
              </div>

              {filteredGroups.length > visibleGroups.length ? (
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
                    Show 60 more elements
                  </button>
                </div>
              ) : null}
            </div>

            <div className="generator-preview">
              <div className="generator-preview__header">
                <div>
                  <div className="panel__title">
                    {preview?.filename ?? "Code Preview"}
                  </div>
                  <div className="panel__meta">
                    {preview
                      ? `Saved ${new Date(preview.createdAt).toLocaleString()}`
                      : `${selectedGroups.length} properties ready to generate`}
                  </div>
                </div>
                <div className="generator-preview__actions">
                  <button
                    className="secondary-button"
                    disabled={!preview}
                    onClick={() => void handleCopy()}
                    type="button"
                  >
                    Copy
                  </button>
                  <button
                    className="secondary-button"
                    disabled={!preview}
                    onClick={() => {
                      if (preview) {
                        downloadTextFile(
                          safeExportFilename(preview.className, "ts"),
                          preview.content,
                          "text/typescript;charset=utf-8"
                        );
                      }
                    }}
                    type="button"
                  >
                    Download
                  </button>
                </div>
              </div>

              <pre className="code-preview generator-code-preview">
                {preview?.content ??
                  "Select elements, then click Generate & Save to preview the Page Object."}
              </pre>

              {generatedFiles.length > 0 ? (
                <div className="generated-history">
                  <div className="panel__meta">Saved versions</div>
                  {generatedFiles.slice(0, 5).map((file) => (
                    <button
                      className="generated-history__item"
                      key={file.id}
                      onClick={() => setPreview(file)}
                      type="button"
                    >
                      <span>{file.filename}</span>
                      <span>{new Date(file.createdAt).toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}
