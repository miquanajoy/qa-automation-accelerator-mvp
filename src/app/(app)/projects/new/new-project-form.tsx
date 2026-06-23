"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type ProjectResponse = {
  project?: {
    id: string;
  };
  error?: {
    message?: string;
  };
};

export function NewProjectForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          description: String(formData.get("description") ?? "")
        })
      });
      const body = (await response.json()) as ProjectResponse;

      if (!response.ok || !body.project) {
        setError(body.error?.message ?? "Unable to create project");
        return;
      }

      router.push(`/projects/${body.project.id}`);
      router.refresh();
    } catch {
      setError("Unable to reach project API");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <Link className="text-link" href="/projects">
          Back to Projects
        </Link>
        <h1 className="page-title">New Project</h1>
        <p className="page-description">
          Create a project container for pages, elements, locator reports,
          snapshots, and generated files.
        </p>
      </div>

      <section className="panel form-panel">
        <div className="panel__header">
          <div className="panel__title">Project Details</div>
        </div>
        <form className="stack-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Name</span>
            <input name="name" type="text" maxLength={120} required />
          </label>

          <label className="field">
            <span>Description</span>
            <textarea name="description" maxLength={500} rows={5} />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <div className="form-actions">
            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
            <Link className="secondary-button" href="/projects">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
