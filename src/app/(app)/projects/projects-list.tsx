"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProjectListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProjectsResponse = {
  projects: ProjectListItem[];
};

export function ProjectsList() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/projects");

        if (!response.ok) {
          setError("Unable to load projects");
          return;
        }

        const body = (await response.json()) as ProjectsResponse;
        setProjects(body.projects);
      } catch {
        setError("Unable to reach project API");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProjects();
  }, []);

  return (
    <section className="page">
      <div className="page-header page-header--row">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-description">
            Create and manage QA automation projects for crawled pages,
            locators, snapshots, and generated files.
          </p>
        </div>
        <Link className="link-button" href="/projects/new">
          New Project
        </Link>
      </div>

      <section className="panel">
        <div className="panel__header">
          <div className="panel__title">Project List</div>
          <div className="panel__meta">{projects.length} projects</div>
        </div>

        {isLoading ? (
          <div className="empty-state">Loading projects...</div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            No projects yet. Create the first project to start the MVP flow.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <Link className="table-link" href={`/projects/${project.id}`}>
                        {project.name}
                      </Link>
                    </td>
                    <td>{project.description ?? "No description"}</td>
                    <td>{new Date(project.createdAt).toLocaleString()}</td>
                    <td>{new Date(project.updatedAt).toLocaleString()}</td>
                    <td>
                      <Link className="text-link" href={`/projects/${project.id}`}>
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
