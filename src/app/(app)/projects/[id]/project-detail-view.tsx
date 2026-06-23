"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  pageCount: number;
  createdAt: string;
  updatedAt: string;
};

type ProjectDetailResponse = {
  project?: ProjectDetail;
  error?: {
    message?: string;
  };
};

type CrawlHistoryItem = {
  id: string;
  projectId: string;
  url: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
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

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [pages, setPages] = useState<CrawlHistoryItem[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [crawlUrl, setCrawlUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPagesLoading, setIsPagesLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCrawling, setIsCrawling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crawlMessage, setCrawlMessage] = useState<string | null>(null);
  const [crawlError, setCrawlError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const body = (await response.json()) as ProjectDetailResponse;

        if (!response.ok || !body.project) {
          setError(body.error?.message ?? "Unable to load project");
          return;
        }

        setProject(body.project);
        setName(body.project.name);
        setDescription(body.project.description ?? "");
      } catch {
        setError("Unable to reach project API");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProject();
  }, [projectId]);

  useEffect(() => {
    async function loadPages() {
      try {
        const response = await fetch(`/api/projects/${projectId}/pages`);
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
  }, [projectId]);

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          description
        })
      });
      const body = (await response.json()) as ProjectDetailResponse;

      if (!response.ok || !body.project) {
        setError(body.error?.message ?? "Unable to update project");
        return;
      }

      setProject((current) =>
        current
          ? {
              ...current,
              ...body.project
            }
          : null
      );
      setMessage("Project updated");
      router.refresh();
    } catch {
      setError("Unable to reach project API");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const shouldDelete = window.confirm(
      "Delete this project and all related pages, elements, snapshots, and generated files?"
    );

    if (!shouldDelete) {
      return;
    }

    setError(null);
    setMessage(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const body = (await response.json()) as ProjectDetailResponse;
        setError(body.error?.message ?? "Unable to delete project");
        return;
      }

      router.push("/projects");
      router.refresh();
    } catch {
      setError("Unable to reach project API");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleCrawl(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          projectId,
          url: crawlUrl
        })
      });
      const body = (await response.json()) as CrawlResponse;

      if (!response.ok || !body.page) {
        setCrawlError(body.error?.message ?? "Unable to crawl URL");
        return;
      }

      setPages((current) => [body.page as CrawlHistoryItem, ...current]);
      setProject((current) =>
        current
          ? {
              ...current,
              pageCount: current.pageCount + 1
            }
          : null
      );
      setCrawlUrl("");
      setCrawlMessage("Crawl completed and saved");
      router.refresh();
    } catch {
      setCrawlError("Unable to reach crawl API");
    } finally {
      setIsCrawling(false);
    }
  }

  if (isLoading) {
    return (
      <section className="page">
        <div className="empty-state">Loading project...</div>
      </section>
    );
  }

  if (error && !project) {
    return (
      <section className="page">
        <div className="page-header">
          <Link className="text-link" href="/projects">
            Back to Projects
          </Link>
          <h1 className="page-title">Project Detail</h1>
        </div>
        <section className="panel">
          <div className="empty-state">{error}</div>
        </section>
      </section>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <section className="page">
      <div className="page-header page-header--row">
        <div>
          <Link className="text-link" href="/projects">
            Back to Projects
          </Link>
          <h1 className="page-title">{project.name}</h1>
          <p className="page-description">
            View and update project metadata. Related MVP data will be attached
            to this project through pages in later phases.
          </p>
        </div>
        <button
          className="danger-button"
          disabled={isDeleting}
          onClick={handleDelete}
          type="button"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      <div className="metric-grid metric-grid--compact">
        <div className="metric">
          <div className="metric__label">Pages</div>
          <div className="metric__value">{project.pageCount}</div>
          <div className="metric__note">Connected to this project</div>
        </div>
        <div className="metric">
          <div className="metric__label">Created</div>
          <div className="metric__value metric__value--small">
            {new Date(project.createdAt).toLocaleDateString()}
          </div>
          <div className="metric__note">
            {new Date(project.createdAt).toLocaleTimeString()}
          </div>
        </div>
        <div className="metric">
          <div className="metric__label">Updated</div>
          <div className="metric__value metric__value--small">
            {new Date(project.updatedAt).toLocaleDateString()}
          </div>
          <div className="metric__note">
            {new Date(project.updatedAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      <section className="panel form-panel">
        <div className="panel__header">
          <div className="panel__title">Edit Project</div>
        </div>
        <form className="stack-form" onSubmit={handleUpdate}>
          <label className="field">
            <span>Name</span>
            <input
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              maxLength={500}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              value={description}
            />
          </label>

          {message ? <div className="form-success">{message}</div> : null}
          {error ? <div className="form-error">{error}</div> : null}

          <div className="form-actions">
            <button className="primary-button" disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel form-panel">
        <div className="panel__header">
          <div className="panel__title">Crawl URL</div>
        </div>
        <form className="stack-form" onSubmit={handleCrawl}>
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

          {crawlMessage ? (
            <div className="form-success">{crawlMessage}</div>
          ) : null}
          {crawlError ? <div className="form-error">{crawlError}</div> : null}

          <div className="form-actions">
            <button className="primary-button" disabled={isCrawling} type="submit">
              {isCrawling ? "Crawling..." : "Crawl"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel__header">
          <div className="panel__title">Crawl History</div>
          <div className="panel__meta">{pages.length} pages</div>
        </div>

        {isPagesLoading ? (
          <div className="empty-state">Loading crawl history...</div>
        ) : pages.length === 0 ? (
          <div className="empty-state">
            No pages crawled yet. Enter a URL above to capture HTML.
          </div>
        ) : (
          <div className="table-wrap">
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
                        View
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
