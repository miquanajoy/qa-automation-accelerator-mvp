"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

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

type CrawlResponse = {
  page?: CrawlHistoryItem;
  error?: {
    message?: string;
  };
};

export function CrawlWorkspace() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [pages, setPages] = useState<CrawlHistoryItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [crawlUrl, setCrawlUrl] = useState("");
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isPagesLoading, setIsPagesLoading] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [crawlError, setCrawlError] = useState<string | null>(null);
  const [crawlMessage, setCrawlMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/projects");
        const body = (await response.json()) as ProjectsResponse;

        if (!response.ok || !body.projects) {
          setProjectError(body.error?.message ?? "Unable to load projects");
          return;
        }

        setProjects(body.projects);
        setSelectedProjectId((current) => current || body.projects?.[0]?.id || "");
      } catch {
        setProjectError("Unable to reach project API");
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
        return;
      }

      setIsPagesLoading(true);
      setCrawlError(null);

      try {
        const response = await fetch(`/api/projects/${selectedProjectId}/pages`);
        const body = (await response.json()) as PagesResponse;

        if (!response.ok || !body.pages) {
          setCrawlError(body.error?.message ?? "Unable to load crawl history");
          return;
        }

        setPages(body.pages);
      } catch {
        setCrawlError("Unable to reach crawl history API");
      } finally {
        setIsPagesLoading(false);
      }
    }

    void loadPages();
  }, [selectedProjectId]);

  async function handleCrawl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProjectId) {
      setCrawlError("Create or select a project before crawling");
      return;
    }

    setCrawlError(null);
    setCrawlMessage(null);
    setIsCrawling(true);

    try {
      const response = await fetch("/api/crawl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectId: selectedProjectId,
          url: crawlUrl
        })
      });
      const body = (await response.json()) as CrawlResponse;

      if (!response.ok || !body.page) {
        setCrawlError(body.error?.message ?? "Unable to crawl URL");
        return;
      }

      setPages((current) => [body.page as CrawlHistoryItem, ...current]);
      setCrawlUrl("");
      setCrawlMessage("Crawl completed and saved");
    } catch {
      setCrawlError("Unable to reach crawl API");
    } finally {
      setIsCrawling(false);
    }
  }

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  return (
    <section className="page">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Crawl</h1>
          <p className="page-description">
            Select a project, crawl a single URL, and open captured pages for DOM
            analysis.
          </p>
        </div>
        <Link className="link-button" href="/projects/new">
          New Project
        </Link>
      </div>

      <section className="panel form-panel">
        <div className="panel__header">
          <div>
            <div className="panel__title">New Crawl</div>
            <div className="panel__meta">
              Bare domains are normalized to https automatically
            </div>
          </div>
        </div>

        <form className="stack-form" onSubmit={handleCrawl}>
          <label className="field">
            <span>Project</span>
            <select
              disabled={isProjectsLoading || projects.length === 0}
              onChange={(event) => {
                setSelectedProjectId(event.target.value);
                setCrawlMessage(null);
              }}
              required
              value={selectedProjectId}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>URL</span>
            <input
              onChange={(event) => setCrawlUrl(event.target.value)}
              placeholder="crawler-test.com"
              required
              type="text"
              value={crawlUrl}
            />
          </label>

          {projectError ? <div className="form-error">{projectError}</div> : null}
          {crawlMessage ? <div className="form-success">{crawlMessage}</div> : null}
          {crawlError ? <div className="form-error">{crawlError}</div> : null}

          <div className="form-actions">
            <button
              className="primary-button"
              disabled={isCrawling || !selectedProjectId}
              type="submit"
            >
              {isCrawling ? "Crawling..." : "Crawl URL"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div>
            <div className="panel__title">Crawl History</div>
            <div className="panel__meta">
              {selectedProject?.name ?? "No project selected"}
            </div>
          </div>
          <div className="panel__meta">{pages.length} pages</div>
        </div>

        {isProjectsLoading || isPagesLoading ? (
          <div className="empty-state">Loading crawl history...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            Create a project before starting a crawl.
          </div>
        ) : pages.length === 0 ? (
          <div className="empty-state">
            No pages crawled for this project yet.
          </div>
        ) : (
          <div className="table-wrap table-wrap--bounded">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>URL</th>
                  <th>Crawled At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td>{page.title ?? "Untitled page"}</td>
                    <td className="table-cell--wide">{page.url}</td>
                    <td>{new Date(page.createdAt).toLocaleString()}</td>
                    <td>
                      <Link className="text-link" href={`/pages/${page.id}`}>
                        Analyze
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
