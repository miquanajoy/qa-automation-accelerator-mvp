import Link from "next/link";

const metrics = [
  { label: "Projects", value: "0", note: "Project module starts in Phase 2" },
  { label: "Crawl Runs", value: "0", note: "Crawler module starts in Phase 3" },
  { label: "Snapshots", value: "0", note: "Snapshot storage starts in Phase 3" },
  { label: "Locators", value: "0", note: "Locator review starts in Phase 5" }
];

export default function DashboardPage() {
  return (
    <section className="page">
      <div className="page-header">
        <h1 className="page-title">QA Automation Accelerator</h1>
        <p className="page-description">
          Foundation is ready for the crawl, DOM parsing, locator generation,
          and Page Object workflows that will be added in the next phases.
        </p>
      </div>

      <div className="metric-grid">
        {metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <div className="metric__label">{metric.label}</div>
            <div className="metric__value">{metric.value}</div>
            <div className="metric__note">{metric.note}</div>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="panel__header">
          <div className="panel__title">Bootstrap Status</div>
          <Link className="link-button" href="/projects">
            Open Projects
          </Link>
        </div>
        <div className="panel__body">
          Next.js App Router, strict TypeScript, Prisma, PostgreSQL Docker
          Compose, and the Clean Architecture Lite folder structure are in
          place. Business features are intentionally left for later phases.
        </div>
      </section>
    </section>
  );
}
